import { useEffect, useState, useMemo } from "react";
import { nanoid } from "nanoid";
import { getStateInstance } from "../core/index.js";

export const useBuddyState = (key, selector) => {
  const uniqueId = nanoid();
  const stateInstance = getStateInstance();
  const source = stateInstance.getSource(key);

  const [value, setValue] = useState(source?.getValue());

  const observer = {
    id: uniqueId,
    next(nextValue) {
      setValue(nextValue);
    },
    complete() {
      setValue(undefined);
    },
  };

  useEffect(() => {
    source?.subscribe(observer);
    return () => source?.unsubscribe(observer.id);
  }, [source, observer]);

  const updateSource = (nextValue) => source?.next(nextValue);

  const selectedValue = useMemo(
    () => selector ? selector(value) : value,
    [value, selector]
);

  return [selectedValue, updateSource];
};
