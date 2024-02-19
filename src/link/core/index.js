import {Client} from "@ladderlabs/buddy-sdk";
import {useBuddyState} from "../../state";
import {
  BUDDY_CLIENT,
  BUDDY_MEMBERS, BUDDY_MINTS,
  BUDDY_OPTIONS,
  BUDDY_ORGANIZATION,
  BUDDY_PROFILE,
  BUDDY_STATS,
  BUDDY_TREASURIES
} from "./state.js";
import {useCallback, useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

let buddyInstance = null;
export const useInitBuddyLink = (programId) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [client, setClient] = useBuddyState(BUDDY_CLIENT);
  const [options, setOptions] = useBuddyState(BUDDY_OPTIONS);
  const [organization, setOrganization] = useBuddyState(BUDDY_ORGANIZATION);
  const [profile, setProfile] = useBuddyState(BUDDY_PROFILE);
  const [treasuryPDA, setTreasuryPDA] = useState();
  const [members, setMembers] = useBuddyState(BUDDY_MEMBERS);
  const [memberStatistics, setMemberStatistics] = useBuddyState(BUDDY_STATS);
  const [treasuries, setTreasuries] = useBuddyState(BUDDY_TREASURIES);
  const [mints, setMints] = useBuddyState(BUDDY_MINTS);

  const initClient = useCallback(async () => {
    if (connection && publicKey && programId) {
      try {
        buddyInstance = new Client(connection, publicKey, programId);
        return buddyInstance;
      } catch (e) {
        throw Error(`Error Client: ${e}`);
      }
    }
  }, [connection && publicKey && programId]);



  // Client
  useEffect(() => {
    setClient(initClient());
  }, [connection]);

  const getProfile = useCallback(async () => {
    if (client) {
      try {
        return await client.buddy?.getProfile();
      } catch (e) {
        throw Error(`Error Profile: ${e}`)
      }
    }
  }, [client]);

  // Profile
  useEffect(() => {
    if (client) setProfile(getProfile())
  }, [client]);

  const getTreasuryPDA = useCallback(async () => {
    if (client && profile && organization) {
      try {
        const organizationAccount = await client.organization?.getByName(organization);
        return await client.pda?.getTreasuryPDA(profile.account.pda, [10_000], organizationAccount.account.mainTokenMint);
      } catch (e) {
        throw Error(`Error Treasury: ${e}`);
      }
    }
  }, [client, profile, organization]);

  // TreasuryPDA
  useEffect(() => {
    if (client && profile && organization) {
      // Create an async IIFE within useEffect
      (async () => {
        try {
          const pdaValue = await getTreasuryPDA();
          setTreasuryPDA(pdaValue); // Set the state with the resolved value
        } catch (error) {
          console.error(`Failed to set Treasury PDA: ${error}`);
          // Optionally handle the error, e.g., setting an error state
        }
      })();
    }
  }, [client, profile, organization]);

  const getMembers = useCallback(async () => {
    if (client && treasuryPDA) {
      try {
        return await client.member?.getByTreasuryOwner(treasuryPDA)
      } catch (e) {
        throw Error(`Error Members: ${e}`)
      }
    }
  }, [client, treasuryPDA]);

  // Members
  useEffect(() => {
    if (client && treasuryPDA) setMembers(getMembers());
  }, [treasuryPDA, client]);

  const getMemberStats = useCallback(async () => {
    const stats = [];
    for (const member of members) {
      const stat = await member?.getStatistics();
      if (stat) stats.push(stat);
    }
    return stats;
  }, [members]);

  // Member Stats
  useEffect(() => {
    if (options?.statistics && members) setMemberStatistics(getMemberStats());
  }, [members]);

  const getTreasuries = useCallback(async () => {
    return await client?.treasury?.getAllSimpleByBuddy(profile?.account?.pda)
  }, [client, profile]);

  // Treasuries
  useEffect(() => {
    if (client && profile) setTreasuries(getTreasuries());
  }, [client, profile]);

  return {
    client,
    options,
    organization,
    profile,
    treasuryPDA,
    members,
    memberStatistics,
    treasuries,
    mints
  }
};

export const getLinkInstance = () => {
  if (!buddyInstance) {
    throw new Error("Buddy Link has not been initialized.")
  }
  return buddyInstance;
};