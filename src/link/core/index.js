import {Client} from "@ladderlabs/buddy-sdk";
import {getStateInstance, initBuddyState, useBuddyState} from "../../state";
import {
  BUDDY_CLIENT,
  BUDDY_CONNECTION,
  BUDDY_MEMBERS,
  BUDDY_MINTS,
  BUDDY_OPTIONS,
  BUDDY_ORGANIZATION,
  BUDDY_PROFILE,
  BUDDY_STATS,
  BUDDY_TREASURIES
} from "./state.js";

let buddyInstance = null;

// initBuddyState({
//   [BUDDY_CONNECTION]: undefined,
//   [BUDDY_CLIENT]: undefined,
//   [BUDDY_MEMBERS]: undefined,
//   [BUDDY_OPTIONS]: {},
//   [BUDDY_ORGANIZATION]: '',
//   [BUDDY_PROFILE]: undefined,
//   [BUDDY_STATS]: undefined,
//   [BUDDY_TREASURIES]: undefined,
//   [BUDDY_MINTS]: [
//     "95bzgMCtKw2dwaWufV9iZyu64DQo1eqw6QWnFMUSnsuF",
//     "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
//     "11111111111111111111111111111111"
//   ]
// })
export const useInitBuddyLink = (getBuddyState, connection, publicKey, programId) => {
  const [, setConnection] = useBuddyState(BUDDY_CONNECTION);
  const [client, setClient] = useBuddyState(BUDDY_CLIENT);

  console.log('client', client);
  // const [options, setOptions] = useBuddyState(BUDDY_OPTIONS);
  // const [organization, setOrganization] = useBuddyState(BUDDY_ORGANIZATION);
  // const [profile, setProfile] = useBuddyState(BUDDY_PROFILE);
  // const [treasuryPDA, setTreasuryPDA] = useState();
  // const [members, setMembers] = useBuddyState(BUDDY_MEMBERS);
  // const [memberStatistics, setMemberStatistics] = useBuddyState(BUDDY_STATS);
  // const [treasuries, setTreasuries] = useBuddyState(BUDDY_TREASURIES);
  // const [mints, setMints] = useBuddyState(BUDDY_MINTS);

  // useEffect(() => {
  //   setConnection(connection);
  // }, [connection]);
  //
  // const initClient = async () => {
  //   if (connection && publicKey && programId) {
  //     try {
  //       buddyInstance = new Client(connection, publicKey, programId);
  //       return buddyInstance;
  //     } catch (e) {
  //       throw Error(`Error Client: ${e}`);
  //     }
  //   }
  // };
  //
  // // Client
  // useEffect(() => {
  //   setClient(initClient());
  // }, [connection]);
  //
  // const getProfile = async () => {
  //   if (client) {
  //     try {
  //       return await client.buddy?.getProfile();
  //     } catch (e) {
  //       throw Error(`Error Profile: ${e}`)
  //     }
  //   }
  // };
  //
  // // Profile
  // useEffect(() => {
  //   if (client) setProfile(getProfile())
  // }, [client]);
  //
  // const getTreasuryPDA = async () => {
  //   if (client && profile && organization) {
  //     try {
  //       const organizationAccount = await client.organization?.getByName(organization);
  //       return await client.pda?.getTreasuryPDA(profile.account.pda, [10_000], organizationAccount.account.mainTokenMint);
  //     } catch (e) {
  //       throw Error(`Error Treasury: ${e}`);
  //     }
  //   }
  // };
  //
  // // TreasuryPDA
  // useEffect(() => {
  //   if (client && profile && organization) {
  //     // Create an async IIFE within useEffect
  //     (async () => {
  //       try {
  //         const pdaValue = await getTreasuryPDA();
  //         setTreasuryPDA(pdaValue); // Set the state with the resolved value
  //       } catch (error) {
  //         console.error(`Failed to set Treasury PDA: ${error}`);
  //         // Optionally handle the error, e.g., setting an error state
  //       }
  //     })();
  //   }
  // }, [client, profile, organization]);
  //
  // const getMembers = async () => {
  //   if (client && treasuryPDA) {
  //     try {
  //       return await client.member?.getByTreasuryOwner(treasuryPDA)
  //     } catch (e) {
  //       throw Error(`Error Members: ${e}`)
  //     }
  //   }
  // };
  //
  // // Members
  // useEffect(() => {
  //   if (client && treasuryPDA) setMembers(getMembers());
  // }, [treasuryPDA, client]);
  //
  // const getMemberStats = useCallback(async () => {
  //   const stats = [];
  //   for (const member of members) {
  //     const stat = await member?.getStatistics();
  //     if (stat) stats.push(stat);
  //   }
  //   return stats;
  // }, [members]);
  //
  // // Member Stats
  // useEffect(() => {
  //   if (options?.statistics && members) setMemberStatistics(getMemberStats());
  // }, [members]);
  //
  // const getTreasuries = async () => {
  //   return await client?.treasury?.getAllSimpleByBuddy(profile?.account?.pda)
  // };
  //
  // // Treasuries
  // useEffect(() => {
  //   if (client && profile) setTreasuries(getTreasuries());
  // }, [client, profile]);
  //
  // return {
  //   client,
  //   options,
  //   organization,
  //   profile,
  //   treasuryPDA,
  //   members,
  //   memberStatistics,
  //   treasuries,
  //   mints
  // }
};

export const getLinkInstance = () => {
  if (!buddyInstance) {
    throw new Error("Buddy Link has not been initialized.")
  }
  return buddyInstance;
};