
let globalStateInstance = null;

export const Observable = (initialValue) => {
  let value = initialValue;
  let subscriptions = new Map();

  return {
    subscribe(observer) {
      const { id } = observer;
      subscriptions.set(id, observer);
      observer.next(value); // Immediately push the current value upon subscription
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
        // If no observable exists for this id, create a new one
        const newObservable = Observable(value);
        observables.set(id, newObservable);
        newObservable.next(value);
      }
    },
    observables,
  };
};

export const initBuddyState = (initialState) => {
  if (!globalStateInstance) {
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

export const getStateInstance = () => {
  if (!globalStateInstance) {
    throw new Error("State has not been initialized. Please initialize state at the root of your application.");
  }
  return globalStateInstance;
};

export const resetGlobalStateForTesting = () => {
  globalStateInstance = null;
};
