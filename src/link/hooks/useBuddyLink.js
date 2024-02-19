import {useReferrer} from "./useReferrer";
import {useBuddyState} from "../../state";
import {
  BUDDY_CLIENT,
  BUDDY_MEMBERS,
  BUDDY_MINTS,
  BUDDY_ORGANIZATION,
  BUDDY_PROFILE, BUDDY_TREASURIES
} from "../core/state";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Client} from "@ladderlabs/buddy-sdk";
import {sendAllTransactions} from "../utils/helpers";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const useBuddyLink = () => {
  const [client] = useBuddyState(BUDDY_CLIENT);
  const [profile] = useBuddyState(BUDDY_PROFILE);
  const [members] = useBuddyState(BUDDY_MEMBERS);
  const [treasuries] = useBuddyState(BUDDY_TREASURIES);
  const [buddy, setBuddy] = useState();

  const [profileName] = useState(Client.generateProfileName());

  const [organizationName] = useBuddyState(BUDDY_ORGANIZATION);
  const [mints] = useBuddyState(BUDDY_MINTS);
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const { referrer } = useReferrer();

  console.log('members', members);
  console.log('treasuries', treasuries);

  const member = useMemo(() => {
    return members?.[organizationName]?.[0] || null
  }, [members]);

  const createTreasuryInstructions = useCallback(() => {

  },[]);

  const createMemberInstructions = useCallback(
      async (
        isUnique = false,
        thirdPartyPayer,
        extraMint,
        withStats,
        organizationOverride,
        buddyName
  ) => {
    if (!client || !publicKey || (!organizationName && !organizationOverride))
      throw new Error("Client not ready");

    const organizationFinal = organizationOverride || organizationName;
    if (!organizationFinal) throw new Error("Organization not specified");

    const organizationMembers = members[organizationFinal];
    if (isUnique && !organizationMembers.length)
      return {
        instructions: [],
        memberPDA: null,
      };

    const memberName = Client.generateMemberName();
    const instructions = extraMint
        ? await client.initialize.createMemberWithRewards(
          organizationFinal,
          memberName,
          extraMint,
          referrer,
          thirdPartyPayer
  )
  : await client.initialize.createMember(
      organizationFinal,
      memberName,
      referrer,
      thirdPartyPayer,
      buddyName
  );

    let statsInstructions = [];
    if (withStats) {
      statsInstructions = await client.initialize.createMemberStatistics(
        organizationFinal,
        memberName
      );
    }

    return {
      instructions: [...instructions, ...statsInstructions],
      memberPDA: client.pda.getMemberPDA(organizationFinal, memberName),
    };
  },
  [client, publicKey, members, referrer, profile]
);

  const asyncBuddy = async () => {

    return {
      async init(options) {
        // TODO: options.multi and lookup
        // TODO: options.execute
        // TODO: options.volume
        // TODO: options.profile only

        // const missing = {
        //   profile: false,
        //   member: false,
        //   treasuries: []
        // };
        //
        // const buddyName = profile?.account?.name?.toString() || profileName;
        //
        // // Check for Buddy
        // if (client) {
        //
        //   if (profile) {
        //     // Check for Member
        //     if (!member) missing.member = true;
        //     // @ts-ignore
        //     missing.treasuries = mints.filter(mint =>
        //       !treasuries?.find(treasury => treasury?.account?.mint?.toString() === mint)
        //     );
        //   } else {
        //     // Create profile and member and treasuries
        //     missing.profile = true;
        //     missing.member = true;
        //     // @ts-ignore
        //     missing.treasuries = mints;
        //   }
        //
        //   const instructions = [];
        //
        //   // if (missing.profile) {
        //   //   // @ts-ignore
        //   //   const next_profile = await createProfileInstructions(new PublicKey("11111111111111111111111111111111"), undefined, [
        //   //     new PublicKey("95bzgMCtKw2dwaWufV9iZyu64DQo1eqw6QWnFMUSnsuF"),
        //   //     new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        //   //   ]);
        //   //   console.log('next_profile',next_profile?.instructions?.length);
        //   //   instructions.push(...next_profile?.instructions);
        //   // }
        //   if (missing.member) {
        //     // @ts-ignore
        //     const next_member = await createMemberInstructions(false, undefined, undefined, options?.volume, undefined, buddyName);
        //     // @ts-ignore
        //     instructions.push(...next_member?.instructions)
        //   }
        //   if (missing?.treasuries?.length) {
        //     const getTreasuryInstruction = async mint => {
        //       console.log('buddyName', buddyName);
        //       // @ts-ignore
        //       const next_treasury = await createTreasuryInstructions(buddyName, new PublicKey(mint));
        //       console.log('next_treasury', next_treasury);
        //       return next_treasury?.instructions;
        //     };
        //
        //     for (const mint of missing.treasuries) {
        //       console.log('mint', mint);
        //
        //       if (!missing.member) {
        //         instructions.push(...await getTreasuryInstruction(mint));
        //       } else {
        //         if (mint !== "11111111111111111111111111111111") {
        //           instructions.push(...await getTreasuryInstruction(mint));
        //
        //         }
        //       }
        //     }
        //   }
        //
        //   if (options?.execute && instructions.length) {
        //     // Run Transaction
        //     const transaction = new Transaction().add(...instructions);
        //     console.log('missing', missing);
        //     console.log('treasuries', treasuries);
        //     console.log('instructions', instructions);
        //     console.log('transaction', transaction);
        //     await sendAllTransactions(
        //       [transaction],
        //       // @ts-ignore
        //       connection,
        //       publicKey,
        //       signAllTransactions
        //     )
        //     //
        //     // // also refresh buddy state
        //     // await refresh(true, 'full', false)
        //   }

          return {
            instructions: [],
            loading: false,
            success: false,
            signatures: []
          }
        },
      claim(options) {

      }
    }
  }

  useEffect(() => {
    // if (client) asyncBuddy().then(setBuddy);
  }, [client, connection, publicKey, signAllTransactions, profile, member, treasuries, client]);

  return buddy;
};