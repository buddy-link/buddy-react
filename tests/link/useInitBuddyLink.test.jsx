import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import React, { useEffect } from "react";
import {renderReact, waitForEffects} from "../helpers/index.js";
import {useBuddyState} from "../../src";
import { initBuddyState, resetGlobalStateForTesting} from "../../src/index.js";
import {
  BUDDY_CLIENT,
  BUDDY_MEMBERS, BUDDY_MINTS,
  BUDDY_OPTIONS,
  BUDDY_ORGANIZATION,
  BUDDY_PROFILE,
  BUDDY_STATS,
  BUDDY_TREASURIES
} from "../../src/link/core/state.js";
import {useInitBuddyLink} from "../../src/link/index.js";
import {useMockBuddy} from "../../src/link/hooks/useMockBuddy.js";

describe('useBuddyLink', () => {
  let testState = {};

  const getTestState = () => (testState);

  // Start with Fresh global State
  beforeEach(() => {
    resetGlobalStateForTesting()
    const initialState = {
      [BUDDY_CLIENT]: null,
      [BUDDY_MEMBERS]: null,
      [BUDDY_OPTIONS]: {},
      [BUDDY_ORGANIZATION]: '',
      [BUDDY_PROFILE]: null,
      [BUDDY_STATS]: null,
      [BUDDY_TREASURIES]: null,
      [BUDDY_MINTS]: [
        "95bzgMCtKw2dwaWufV9iZyu64DQo1eqw6QWnFMUSnsuF",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "11111111111111111111111111111111"
      ]
    };

    // Initialize Buddy State
    initBuddyState(initialState);
  });

  const onStateChange = (state, setState) => {
    testState.state = state;
    console.log('testState', testState);
  };

  renderReact('Initializes the correct information for the useBuddyLink hook', <TestComponent id={BUDDY_CLIENT} onStateChange={onStateChange}/>, () => {

    waitForEffects(() => {
      const next_state = getTestState();

      const client = next_state?.state?.client;
      const profile = next_state?.state?.profile;

      return [client, profile];
    });

    const client = testState?.state?.client;
    expect(client).any;
    // client


    // connection


    // profile


    // members


    // treasuries


    // organization


    // mints


  })

  // Cleanup
  afterEach(() => {
    resetGlobalStateForTesting()
  })
});

const TestComponent = ({ id, onStateChange }) => {
const state = useMockBuddy();
  // const state = useInitBuddyLink('ELEMisgsfkmp58w1byRvrdpGG1HcapQoCrmMJeorBCxq');


  // Use useEffect to notify about state changes
  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  return null; // This component does not render anything
};