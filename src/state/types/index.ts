export type ObserverType<T> = {
  id: string;
  next: (value: T) => void;
  complete?: () => void;
};

export type ObservableType<T> = {
  subscribe: (observer: ObserverType<T>) => void;
  unsubscribe: (id: string) => void;
  next: (nextValue: T) => void;
  complete: () => void;
  getValue: () => T;
};

export type InitialStateType<T> = {
  init: (observables: Map<string, ObservableType<T>>) => void;
};

export type EventBusType<T> = {
  getSource: (id: string) => ObservableType<T> | undefined;
  update: (id: string, value: T) => void;
  observables: Map<string, ObservableType<T>>;
};