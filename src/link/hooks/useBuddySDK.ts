import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Client,
  Buddy,
  Member,
  MemberStatisticsAccount,
  Treasury,
  Organization,
  DEVNET_PROGRAM_ID,
  USDC_MINT,
} from "@ladderlabs/buddy-sdk";
import {
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { executeTransaction } from '../utils/helpers';
import {IBuddySDK} from "../types";
import { usePrevious } from "../../hooks/usePrevious";
import {useBuddyState} from "../../state";
import {BUDDY_PUBLIC_KEY} from "../state";

export function useBuddySDK(environment = "mainnet", organizationName = "",  referrer = ""): IBuddySDK | null {
  const { connection } = useConnection();
  const [publicKey] = useBuddyState(BUDDY_PUBLIC_KEY);
  const { signTransaction } = useWallet();
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<Buddy | null>(null);
  const [options, setOptions] = useState({
    depth: "simple",
    allowWalletSwapRefresh: false,
    statistics: false,
  });
  const prevPublicKey = usePrevious<PublicKey | null>(publicKey);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<{ [organization: string]: Member[] }>(
    {}
  );
  const [memberStatistics, setMemberStatistics] = useState<{
    [organization: string]: MemberStatisticsAccount[];
  }>({});
  const [treasuries, setTreasuries] = useState<Treasury[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  //Want to automatically clear data when wallet disconnects? Or swaps between wallets?
  const clearData = useCallback(async () => {
    setProfile(null);
    setBuddies([]);
    setOrganizations([]);
    setMembers({});
    setMemberStatistics({});
    setTreasuries([]);
  }, []);

  const initializeData = useCallback(
    async (
      allowWalletSwapRefresh = false,
      depth = "simple",
      statistics = false
    ) => {
      if (!connection || !publicKey) throw new Error("Client not ready");

      const client = new Client(
        connection,
        publicKey,
        environment === "devnet" ? DEVNET_PROGRAM_ID : undefined
      );
      setClient(client);

      setOptions({
        depth,
        allowWalletSwapRefresh,
        statistics,
      });
      setLoadingData(true);
      const profile = await client.buddy.getProfile();
      setProfile(profile);

      if (!profile) {
        setLoadingData(false);
        return;
      }

      if (organizationName) {
        const organizationAccount = await client.organization.getByName(
          organizationName
        );
        if (!organizationAccount) throw new Error("Organization not found");
        setOrganizations([organizationAccount]);

        const treasuryPDA = client.pda.getTreasuryPDA(
          [profile.account.pda],
          [10_000],
          organizationAccount.account.mainTokenMint
        );
        const treasury = await client.treasury.getByPDA(treasuryPDA);
        if (!treasury) {
          setLoadingData(false);
          return;
        }

        const members = await client.member.getByTreasuryOwner(treasuryPDA);
        setMembers({
          [organizationName]: members,
        });

        if (statistics) {
          const stats = [];
          for (const member of members) {
            const stat = await member.getStatistics();
            if (stat) stats.push(stat);
          }

          setMemberStatistics({
            [organizationName]: stats,
          });
        }
      } else {
        if (depth === "full") {
          const organizations = await client.organization.getAll();
          setOrganizations(organizations);

          const members: { [organization: string]: Member[] } = {};
          const stats: { [organization: string]: MemberStatisticsAccount[] } =
            {};

          //TODO: revist. Might be a scaling issue too many calls inside getByWallet
          for (const organization of organizations) {
            const orgMembers = await client.member.getByWallet(
              organization.account.name,
              publicKey
            );
            members[organization.account.name] = orgMembers;

            if (statistics) {
              const orgStats = [];
              for (const member of orgMembers) {
                const stat = await member.getStatistics();
                if (stat) orgStats.push(stat);
              }
              stats[organization.account.name] = orgStats;
            }
          }

          setMembers(members);
          if (statistics) setMemberStatistics(stats);
        }
      }

      if (depth === "simple") {
        const treasuries = await client.treasury.getAllSimpleByBuddy(
          profile.account.pda
        );
        setTreasuries(treasuries);
        setBuddies([profile]);
      } else {
        const treasuries = await client.treasury.getAllByBuddy(
          profile.account.pda
        );
        setTreasuries(treasuries);

        const buddies = await client.buddy.getAllByProfile(profile.account.pda);
        setBuddies([profile, ...buddies]);
      }
      setLoadingData(false);
    },
    [connection, publicKey, organizationName, environment]
  );

  const createProfileInstructions = useCallback(
    async (
      mint: PublicKey = new PublicKey(USDC_MINT),
      thirdPartyPayer?: PublicKey,
      extraTreasuryMints: PublicKey[] = []
    ) => {
      if (!client || !publicKey) throw new Error("Client not ready");
      if (profile)
        return {
          instructions: [],
          profilePDA: null,
        };

      const profileName = Client.generateProfileName();
      let instructions = await client.initialize.createProfile(
        profileName,
        referrer!,
        mint,
        thirdPartyPayer
      );

      instructions.push(
        ...(await client.initialize.createTreasuryByName(profileName, mint))
      );

      if (extraTreasuryMints.length) {
        for (const extraMint of extraTreasuryMints) {
          const treasuryInstructions =
            await client.initialize.createTreasuryByName(
              profileName,
              extraMint
            );

          instructions.push(...treasuryInstructions);
        }
      }

      return {
        instructions,
        profilePDA: client.pda.getProfilePDA(profileName),
      };
    },
    [client, publicKey, profile, referrer]
  );

  const createProfile = useCallback(
    async (
      mint: PublicKey = new PublicKey(USDC_MINT),
      thirdPartyPayer?: PublicKey,
      extraTreasuryMints: PublicKey[] = []
    ) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await createProfileInstructions(
        mint,
        thirdPartyPayer,
        extraTreasuryMints
      );

      return await executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      connection,
      signTransaction,
      profile,
      createProfileInstructions,
    ]
  );

  const createTreasuryInstructions = useCallback(
    async (
      buddyName: string,
      mint?: PublicKey,
      thirdPartyPayer?: PublicKey
    ) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const buddyPDA = client.pda.getBuddyPDA(buddyName);
      const treasuryPDA = client.pda.getTreasuryPDA([buddyPDA], [10_000], mint);

      if (
        treasuries.find(
          (treasury) =>
            treasury.account.pda.toString() === treasuryPDA.toString()
        )
      )
        return {
          instructions: [],
          treasuryPDA: null,
        };

      const instructions = await client.initialize.createTreasuryByName(
        buddyName,
        mint,
        thirdPartyPayer
      );

      return {
        instructions,
        treasuryPDA,
      };
    },
    [client, publicKey, treasuries]
  );

  const createTreasury = useCallback(
    async (
      buddyName: string,
      mint?: PublicKey,
      thirdPartyPayer?: PublicKey
    ) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");
      const { instructions } = await createTreasuryInstructions(
        buddyName,
        mint,
        thirdPartyPayer
      );

      return await executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      connection,
      signTransaction,
      treasuries,
      createTreasuryInstructions,
    ]
  );

  const claimTreasuryInstructions = useCallback(
    async (treasury: Treasury) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const instructions = await treasury.claim();

      return {
        instructions,
      };
    },
    [client, publicKey]
  );

  const claimTreasury = useCallback(
    async (treasury: Treasury) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await claimTreasuryInstructions(treasury);

      return await executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [client, publicKey, connection, signTransaction, claimTreasuryInstructions]
  );

  const createMemberInstructions = useCallback(
    async (
      isUnique = false,
      thirdPartyPayer?: PublicKey,
      extraMint?: PublicKey,
      withStats?: boolean,
      organizationOverride?: string,
    ) => {
      if (!client || !publicKey || (!organizationName && !organizationOverride))
        throw new Error("Client not ready");

      const organizationFinal = organizationOverride || organizationName;
      if (!organizationFinal) throw new Error("Organization not specified");

      const organizationMembers = members[organizationFinal!];
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
          referrer!,
          thirdPartyPayer
        )
        : await client.initialize.createMember(
          organizationFinal,
          memberName,
          referrer!,
          thirdPartyPayer
        );

      let statsInstructions: TransactionInstruction[] = [];
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
    [client, publicKey, members, organizationName, referrer]
  );

  const createMember = useCallback(async () => {
    if (!client || !publicKey || !signTransaction)
      throw new Error("Client not ready");

    const { instructions } = await createMemberInstructions();

    return await executeTransaction(
      instructions,
      publicKey,
      signTransaction,
      connection
    );
  }, [client, publicKey, signTransaction]);

  const validateReferrerAccounts = useCallback(
    async (mint: PublicKey, memberPDA: PublicKey, allowStats?: boolean) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      return await client.accounts.validateReferrerAccounts(
        mint,
        memberPDA,
        allowStats
      );
    },
    [client, publicKey]
  );

  const validateReferrerInstructions = useCallback(
    async (mint: PublicKey, memberPDA: PublicKey, allowStats?: boolean) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const instruction = await client.initialize.validateReferrer(
        mint,
        allowStats,
        memberPDA
      );

      return {
        instructions: [instruction],
      };
    },
    [client, publicKey]
  );

  const validateReferrer = useCallback(
    async (mint: PublicKey, memberPDA: PublicKey, allowStats?: boolean) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await validateReferrerInstructions(
        mint,
        memberPDA,
        allowStats
      );

      return executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      signTransaction,
      connection,
      validateReferrerInstructions,
    ]
  );

  const transferRewardsAccounts = useCallback(
    async (mint: PublicKey, memberPDA: PublicKey, allowStats?: boolean) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      return await client.accounts.transferRewardsAccount(
        memberPDA,
        mint,
        allowStats
      );
    },
    [client, publicKey]
  );

  const transferRewardsInstructions = useCallback(
    async (
      mint: PublicKey,
      memberPDA: PublicKey,
      amount: number,
      allowStats?: boolean,
      allowMultiLevel?: boolean
    ) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const instructions = await client.transfer.transferRewards(
        memberPDA,
        amount,
        mint,
        allowMultiLevel,
        allowStats
      );

      return { instructions };
    },
    [client, publicKey]
  );

  const transferRewards = useCallback(
    async (
      mint: PublicKey,
      memberPDA: PublicKey,
      amount: number,
      allowStats?: boolean,
      allowMultiLevel?: boolean
    ) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await transferRewardsInstructions(
        mint,
        memberPDA,
        amount,
        allowStats,
        allowMultiLevel
      );

      return executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      connection,
      signTransaction,
      transferRewardsInstructions,
    ]
  );

  const transferRewardsNoMultiLevelAccounts = useCallback(
    async (memberPDA: PublicKey, mint: PublicKey, allowStats?: boolean) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      return await client.accounts.transferRewardsNoMultiLevelAccount(
        memberPDA,
        mint,
        allowStats
      );
    },
    [client, publicKey]
  );

  const transferRewardsNoMultiLevelInstructions = useCallback(
    async (
      memberPDA: PublicKey,
      amount: number,
      mint: PublicKey,
      allowStats?: boolean
    ) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const instructions = await client.transfer.transferRewardsNoMultiLevel(
        memberPDA,
        amount,
        mint,
        allowStats
      );

      return { instructions };
    },
    [client, publicKey]
  );

  const transferRewardsNoMultiLevel = useCallback(
    async (
      memberPDA: PublicKey,
      amount: number,
      mint: PublicKey,
      allowStats?: boolean
    ) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await transferRewardsNoMultiLevelInstructions(
        memberPDA,
        amount,
        mint,
        allowStats
      );

      return executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      connection,
      signTransaction,
      transferRewardsNoMultiLevelInstructions,
    ]
  );

  const transferRewardsGlobalAccounts = useCallback(
    async (buddyPDA: PublicKey, mint: PublicKey) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      return await client.accounts.transferRewardsGlobalBuddiesAccount(
        publicKey,
        buddyPDA,
        mint
      );
    },
    [client, publicKey]
  );

  const transferRewardsGlobalInstructions = useCallback(
    async (buddyPDA: PublicKey, amount: number, mint: PublicKey) => {
      if (!client || !publicKey) throw new Error("Client not ready");

      const instructions = await client.transfer.transferRewardsGlobalBuddies(
        buddyPDA,
        amount,
        mint
      );

      return { instructions };
    },
    []
  );

  const transferRewardsGlobal = useCallback(
    async (buddyPDA: PublicKey, amount: number, mint: PublicKey) => {
      if (!client || !publicKey || !signTransaction)
        throw new Error("Client not ready");

      const { instructions } = await transferRewardsGlobalInstructions(
        buddyPDA,
        amount,
        mint
      );

      return executeTransaction(
        instructions,
        publicKey,
        signTransaction,
        connection
      );
    },
    [
      client,
      publicKey,
      connection,
      signTransaction,
      transferRewardsGlobalInstructions,
    ]
  );

  useEffect(() => {
    if (
      options.allowWalletSwapRefresh &&
      publicKey &&
      prevPublicKey?.toString() !== publicKey?.toString()
    ) {
      console.log("updating", options, prevPublicKey, publicKey);
      clearData();
      initializeData(
        options.allowWalletSwapRefresh,
        options.depth,
        options.statistics
      );
    }
  }, [prevPublicKey, publicKey, options, clearData, initializeData]);

  return {
    client,
    profile,
    loadingData,
    organizations,
    members,
    memberStatistics,
    treasuries,
    isReady: !!client,
    isWalletConnected: !!publicKey,
    buddies,
    init: initializeData,
    refresh: initializeData,
    clearData,
    createProfileInstructions,
    createProfile,
    createTreasuryInstructions,
    createTreasury,
    claimTreasuryInstructions,
    claimTreasury,
    createMemberInstructions,
    createMember,
    validateReferrerAccounts,
    validateReferrerInstructions,
    validateReferrer,
    transferRewardsAccounts,
    transferRewardsInstructions,
    transferRewards,
    transferRewardsNoMultiLevelAccounts,
    transferRewardsNoMultiLevelInstructions,
    transferRewardsNoMultiLevel,
    transferRewardsGlobalAccounts,
    transferRewardsGlobalInstructions,
    transferRewardsGlobal,
  } as IBuddySDK;
}