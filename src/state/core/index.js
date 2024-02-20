
let globalStateInstance = null;

/**
 * Factory function to create an Observable.
 * @param {*} initialValue The initial value of the Observable.
 * @returns An object representing the observable with methods to subscribe, unsubscribe, push next values, complete the observable, and get the current value.
 */
export const Observable = (initialValue) => {
  let value = initialValue;
  let subscriptions = new Map();

  return {
    subscribe(observer) {
      const { id } = observer;
      subscriptions.set(id, observer);
      observer.next(value);
    },
    unsubscribe(id) {
      subscriptions.delete(id);
    },
    next(nextValue) {
      value = nextValue;
      subscriptions.forEach((observer) => observer.next(nextValue));
    },
    complete() {
      subscriptions.forEach((observer) => observer.complete());
      subscriptions.clear();
    },
    getValue() {
      return value;
    },
  };
};

/**
 * Creates an event bus with a given initial state.
 * @param {Object} initialState The initial state for the event bus.
 * @returns An object representing the event bus with methods to get source, update values, and access the observables.
 */
const createEventBus = (initialState) => {
  const observables = new Map();
  initialState.init(observables);

  return {
    getSource(id) {
      const next_source = observables.get(id);
      if (!next_source) console.log(`Could not find buddyState for ${id}, please add to initialState`);
      return next_source;
    },
    update(id, value) {
      const observable = observables.get(id);
      if (observable) {
        observable.next(value);
      } else {
        const newObservable = Observable(value);
        observables.set(id, newObservable);
        newObservable.next(value);
      }
    },
    observables,
  };
};

/**
 * Initializes the global state with the provided initial state.
 * @param {Object} initialState The initial state object.
 */
export const initBuddyState = (initialState) => {
  if (!globalStateInstance) {
    console.log('Initializing State');
    globalStateInstance = createEventBus({
      init(observables) {
        Object.keys(initialState).forEach((key) => {
          observables.set(key, Observable(initialState[key]));
        });
      },
    });
  } else {
    console.warn("State has already been initialized.");
  }
};

/**
 * Returns the global state instance.
 * @returns The global state instance.
 * @throws If the state has not been initialized.
 */
export const getStateInstance = () => {
  if (!globalStateInstance) {
    throw new Error("State has not been initialized. Please initialize state at the root of your application.");
  }
  return globalStateInstance;
};

/**
 * Resets the global state for testing purposes.
 */
export const resetGlobalStateForTesting = () => {
  globalStateInstance = null;
};
