import {useBuddyState} from "../../state/index.js";
import {
  BUDDY_CLIENT,
  BUDDY_MEMBERS, BUDDY_MINTS,
  BUDDY_ORGANIZATION,
  BUDDY_PROFILE,
  BUDDY_TREASURIES
} from "../core/state.js";
import {useEffect, useState} from "react";
import {Client} from "@ladderlabs/buddy-sdk";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useReferrer} from "./useReferrer.js";


export const useMockBuddy = () => {
  const [mints] = useBuddyState(BUDDY_MINTS);



  return {
    mints
  }
}