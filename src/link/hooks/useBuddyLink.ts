import { useCallback, useEffect, useState, useMemo } from "react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Client } from "@ladderlabs/buddy-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useReferrers } from "./useReferrers";
import { useBuddySDK } from './useBuddySDK';
import { useBuddyState } from "../../state";
import {BUDDY_MINTS, BUDDY_ORGANIZATION, BUDDY_CLIENT, BUDDY_CONNECTION, BUDDY_PUBLIC_KEY} from "../state";
import { sendAllTransactions } from "../utils/helpers";

// Assume USDC_MINT and other constants are defined elsewhere

type Buddy = {
  init: (options: any) => Promise<{
    instructions: TransactionInstruction[];
    loading: boolean;
    success: boolean;
    signatures: string[];
  }>;
  claim: (options: any) => void;
};

const defaultBuddy: Buddy = {
  init: async (options: any) => ({
    instructions: [],
    loading: false,
    success: false,
    signatures: [],
  }),
  claim: (options: any) => {},
};

export const useBuddyLink = () => {
  const [client] = useBuddyState(BUDDY_CLIENT);
  const [connection] = useBuddyState(BUDDY_CONNECTION);
  const [publicKey] = useBuddyState(BUDDY_PUBLIC_KEY);
  const [buddy, setBuddy] = useState<Buddy>(defaultBuddy);
  const [profileName] = useState(Client.generateProfileName());

  const [organizationName] = useBuddyState(BUDDY_ORGANIZATION);
  const [mints] = useBuddyState(BUDDY_MINTS);
  const { signAllTransactions } = useWallet();
  const { referrer } = useReferrers();

  const {
    // @ts-ignore
    profile,
    // @ts-ignore
    members,
    // @ts-ignore
    treasuries,
    // @ts-ignore
    refresh,
    // @ts-ignore
    createTreasuryInstructions
  } = useBuddySDK();

  const member = useMemo(() => {
    return members?.["elementerra"]?.[0] || null
  }, [members]);

  const createMemberInstructions = useCallback(
    async (
      isUnique = false,
      thirdPartyPayer?: PublicKey,
      extraMint?: PublicKey,
      withStats?: boolean,
      organizationOverride?: string,
      buddyName?: string
    ) => {
      if (!client || !publicKey || (!organizationName && !organizationOverride))
        throw new Error("Client not ready");

      const organizationFinal = organizationOverride || organizationName;
      if (!organizationFinal) throw new Error("Organization not specified");

      // @ts-ignore
      const organizationMembers = members[organizationFinal!];
      if (isUnique && !organizationMembers.length)
        return {
          instructions: [],
          memberPDA: null,
        };

      const memberName = Client.generateMemberName();
      const instructions = extraMint
        // @ts-ignore
        ? await client.initialize.createMemberWithRewards(
          organizationFinal,
          memberName,
          extraMint,
          referrer!,
          thirdPartyPayer
        )
        // @ts-ignore
        : await client.initialize.createMember(
          organizationFinal,
          memberName,
          referrer!,
          thirdPartyPayer,
          buddyName
        );

      let statsInstructions: TransactionInstruction[] = [];
      if (withStats) {
        // @ts-ignore
        statsInstructions = await client.initialize.createMemberStatistics(
          organizationFinal,
          memberName
        );
      }

      return {
        instructions: [...instructions, ...statsInstructions],
        // @ts-ignore
        memberPDA: client.pda.getMemberPDA(organizationFinal, memberName),
      };
    },
    [client, publicKey, members, referrer, profile]
  );

  const asyncBuddy = async () => {

    return {
      // @ts-ignore
      async init(options) {
        // TODO: options.multi and lookup
        // TODO: options.execute
        // TODO: options.volume
        // TODO: options.profile only

        const missing = {
          profile: false,
          member: false,
          treasuries: []
        };

        const buddyName = profile?.account?.name?.toString() || profileName;

        // Check for Buddy
        // @ts-ignore
        if (client) {

          if (profile) {
            // Check for Member
            if (!member) missing.member = true;
            // @ts-ignore
            missing.treasuries = mints.filter(mint =>
              // @ts-ignore
              !treasuries?.find(treasury => treasury?.account?.mint?.toString() === mint)
            );
          } else {
            // Create profile and member and treasuries
            missing.profile = true;
            missing.member = true;
            // @ts-ignore
            missing.treasuries = mints;
          }

          const instructions = [];

          // if (missing.profile) {
          //   // @ts-ignore
          //   const next_profile = await createProfileInstructions(new PublicKey("11111111111111111111111111111111"), undefined, [
          //     new PublicKey("95bzgMCtKw2dwaWufV9iZyu64DQo1eqw6QWnFMUSnsuF"),
          //     new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
          //   ]);
          //   console.log('next_profile',next_profile?.instructions?.length);
          //   instructions.push(...next_profile?.instructions);
          // }
          if (missing.member) {
            // @ts-ignore
            const next_member = await createMemberInstructions(false, undefined, undefined, options?.volume, undefined, buddyName);
            // @ts-ignore
            instructions.push(...next_member?.instructions)
          }
          if (missing?.treasuries?.length) {
            // @ts-ignore
            const getTreasuryInstruction = async mint => {
              console.log('buddyName', buddyName);
              // @ts-ignore
              const next_treasury = await createTreasuryInstructions(buddyName, new PublicKey(mint));
              console.log('next_treasury', next_treasury);
              return next_treasury?.instructions;
            };

            for (const mint of missing.treasuries) {
              console.log('mint', mint);

              if (!missing.member) {
                instructions.push(...await getTreasuryInstruction(mint));
              } else {
                if (mint !== "11111111111111111111111111111111") {
                  instructions.push(...await getTreasuryInstruction(mint));

                }
              }
            }
          }

          if (options?.execute && instructions.length) {
            // Run Transaction
            const transaction = new Transaction().add(...instructions);
            console.log('missing', missing);
            console.log('treasuries', treasuries);
            console.log('instructions', instructions);
            console.log('transaction', transaction);
            await sendAllTransactions(
              [transaction],
              // @ts-ignore
              connection,
              publicKey,
              signAllTransactions
            )

            // also refresh buddy state
            await refresh(true, 'full', false)
          }

          return {
            instructions,
            loading: false,
            success: false,
            signatures: []
          }
        }
      },
      // @ts-ignore
      claim(options) {

      }
    }
  }

  useEffect(() => {
    // @ts-ignore
    if (client) asyncBuddy().then(setBuddy);
    // @ts-ignore
  }, [client, connection, publicKey, signAllTransactions, refresh, profile, member, treasuries, client]);

  return buddy;
};
