import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {initBuddyState, getStateInstance, resetGlobalStateForTesting} from '../../src';


describe('initBuddyState', () => {
  beforeEach(() => {
    resetGlobalStateForTesting()
  });

  it('Initialize state with simple test object', () => {
    const initialState = {test: 'hello world'};
    initBuddyState(initialState);

    const stateInstance = getStateInstance();

    // Verify that the state instance is not null
    expect(stateInstance).not.toBeNull();

    // Verify the observables are created for each key in the initial state
    Object.keys(initialState).forEach((key) => {
      const source = stateInstance.getSource(key);
      expect(source).not.toBeUndefined();
      expect(source.getValue()).toEqual(initialState[key]);
    });
  });

  afterEach(() => {
    resetGlobalStateForTesting()
  })
})