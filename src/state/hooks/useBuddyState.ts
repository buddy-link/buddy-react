import { useEffect, useState, useMemo } from "react";
import { nanoid } from "nanoid";
import { getStateInstance } from '../core';

export const useBuddyState = (
  key: string,
  selector?: (state: any) => any
): [any, (nextValue: any) => void] => {
  const uniqueId = nanoid();
  const stateInstance = getStateInstance<any>();
  const source = stateInstance?.getSource(key);

  const [value, setValue] = useState<any>(source?.getValue());

  const observer = {
    id: uniqueId,
    next: (nextValue: any) => {
      setValue(nextValue);
    },
    complete: () => {
      setValue(undefined);
    },
  };

  useEffect(() => {
    source?.subscribe(observer);
    return () => source?.unsubscribe(observer.id);
  }, [source, observer]);

  const updateSource = (nextValue: any) => source?.next(nextValue);

  const selectedValue = useMemo(() => {
    return selector ? selector(value) : value;
  }, [value, selector]);

  return [selectedValue, updateSource];
};
