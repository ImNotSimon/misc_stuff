import { getUniqueID } from '@/components/ui/util/va';
import type React from 'react';
import { useCallback, useState } from 'react';

export type RippleType = {
  key: React.Key;
  x: number;
  y: number;
  size: number;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseRippleProps {}

export function useRipple(props: UseRippleProps = {}) {
  const [ripples, setRipples] = useState<RippleType[]>([]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const trigger = event.currentTarget;

      const size = Math.max(trigger.clientWidth, trigger.clientHeight);
      const rect = trigger.getBoundingClientRect();

      setRipples((prevRipples) => [
        ...prevRipples,
        {
          key: getUniqueID(prevRipples.length.toString()),
          size,
          x: event.clientX - rect.x - size / 2,
          y: event.clientY - rect.y - size / 2,
        },
      ]);
    },
    [],
  );

  const onClear = useCallback((key: React.Key) => {
    setRipples((prevState) => prevState.filter((ripple) => ripple.key !== key));
  }, []);

  return { ripples, onClick, onClear, ...props };
}

export type UseRippleReturn = ReturnType<typeof useRipple>;
