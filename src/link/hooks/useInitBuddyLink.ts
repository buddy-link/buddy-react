import { Connection, PublicKey } from "@solana/web3.js";
import { Client } from "@ladderlabs/buddy-sdk";
import {initBuddyState, useBuddyState} from "../../state";
import { BUDDY_CLIENT, BUDDY_CONNECTION, BUDDY_PUBLIC_KEY } from "../state";
import { useEffect } from "react";

// Define the type for the Buddy instance as Client or null
let buddyInstance: Client | null = null;

initBuddyState({
  [BUDDY_CLIENT]: null,
  [BUDDY_CONNECTION]: null,
  [BUDDY_PUBLIC_KEY]: null
});
export const useInitBuddyLink = (connection: Connection, wallet?: PublicKey, programId?: string): void => {
  const [buddy, setBuddyClient] = useBuddyState(BUDDY_CLIENT);
  const [buddyConnection, setBuddyConnection] = useBuddyState(BUDDY_CONNECTION);
  const [buddyPublicKey, setBuddyPublicKey] = useBuddyState(BUDDY_PUBLIC_KEY);

  if (!buddyInstance && buddyConnection) {
    buddyInstance = new Client(buddyConnection, wallet, programId);
  }

  useEffect(() => {
    setBuddyConnection(connection);
  }, [connection, setBuddyConnection]);

  useEffect(() => {
    setBuddyClient(buddyInstance);
  }, [buddyInstance, setBuddyClient]);

  useEffect(() => {
    setBuddyPublicKey(wallet)
  }, [wallet]);
};

export const getLinkInstance = (): Client => {
  if (!buddyInstance) {
    throw new Error("Buddy Link has not been initialized.");
  }
  return buddyInstance;
};
