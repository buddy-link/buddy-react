import { ObserverType, ObservableType, InitialStateType, EventBusType } from '../types';


let globalStateInstance: EventBusType<any> | null = null;

export const Observable = <T>(initialValue: T): ObservableType<T> => {
  let value = initialValue;
  let subscriptions = new Map<string, ObserverType<T>>();

  return {
    subscribe(observer: ObserverType<T>) {
      const { id } = observer;
      subscriptions.set(id, observer);
      observer.next(value); // Immediately push the current value upon subscription
    },
    unsubscribe(id: string) {
      subscriptions.delete(id);
    },
    next(nextValue: T) {
      value = nextValue;
      subscriptions.forEach((observer) => observer.next(nextValue));
    },
    complete() {
      subscriptions.forEach((observer) => observer.complete?.());
      subscriptions.clear();
    },
    getValue() {
      return value;
    },
  };
};

const createEventBus = <T>(initialState: InitialStateType<T>): EventBusType<T> => {
  const observables = new Map<string, ObservableType<T>>();
  initialState.init(observables);

  return {
    getSource(id: string) {
      return observables.get(id);
    },
    update(id: string, value: T) {
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

export const initBuddyState = <T>(initialState: { [key: string]: T }) => {
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

export const getStateInstance = <T>(): EventBusType<T> => {
  if (!globalStateInstance) {
    throw Error("State has not been initialized. Please initialize state at the root of your application.");
  }
  return globalStateInstance as EventBusType<T>;
};
