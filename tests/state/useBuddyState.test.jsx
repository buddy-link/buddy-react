import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import React, {useEffect} from 'react';
import {renderReact} from "../helpers/index.js";
import {useBuddyState} from "../../src";
import {getStateInstance, initBuddyState, resetGlobalStateForTesting} from "../../src/index.js";


// vi.mock('../../src/state/hooks/useBuddyState.js', () => ({
//   getStateInstance: vi.fn(() => ({
//     getSource: vi.fn(() => ({
//       subscribe: (observer) => observer.next('initialValue'),
//       unsubscribe: vi.fn(),
//       next: vi.fn(),
//       getValue: vi.fn(() => 'initialValue'),
//     })),
//   })),
// }));

describe('useBuddyState', () => {
  let testState = {};

  // Start with Fresh global State
  beforeEach(() => {
    resetGlobalStateForTesting()
    const initialState = {test: 'hello world'};
    initBuddyState(initialState);
  });

  it('Initialize state with simple test object', () => {
    const initialState = {test: 'hello world'};
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

  const onStateChange = (state, setState) => {
    testState.state = state;
  };

  // Test withing a React Component
  renderReact('Tests that useBuddyState contains state', <TestComponent id={'test'} onStateChange={onStateChange}/>, () => {
    expect(testState.state).toContain('hello world');
  })


  // Cleanup
  afterEach(() => {
    resetGlobalStateForTesting()
  })
});

const TestComponent = ({ id, onStateChange }) => {
  const [state, setState] = useBuddyState(id);

  // Use useEffect to notify about state changes
  useEffect(() => {
    onStateChange(state, setState);
  }, [state, onStateChange]);

  return null; // This component does not render anything
};