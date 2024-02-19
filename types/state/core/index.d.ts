export function Observable(initialValue: any): {
    subscribe(observer: any): void;
    unsubscribe(id: any): void;
    next(nextValue: any): void;
    complete(): void;
    getValue(): any;
};
export function initBuddyState(initialState: any): void;
export function getStateInstance(): any;
export function resetGlobalStateForTesting(): void;
