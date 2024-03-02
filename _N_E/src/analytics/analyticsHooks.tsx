import {
  AmplitudeExperimentationFactory,
  type AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import useUser from '@/lib/hooks/useUser';
import { amplitudeFetchedSignal } from '@/lib/state/signals';
import { type Variant } from '@amplitude/experiment-js-client';
import { useEffect, useState } from 'react';
import { useSignalValue } from 'signals-react-safe';

export const useAmplitudeVariant = (key: AmplitudeVariants) => {
  const experimentsFetched = useSignalValue(amplitudeFetchedSignal);
  const [variant, setVariant] = useState<Variant | undefined>(undefined);
  const { user } = useUser();

  useEffect(() => {
    if (experimentsFetched) {
      const v = AmplitudeExperimentationFactory.getAmplitudeVariant(key);
      const maybeLocalVariant = getAmplitudeLocalOverride(key);

      if (maybeLocalVariant && v && user?.user?.is_staff) {
        v.value = maybeLocalVariant;
      }
      setVariant(v);
    }
  }, [experimentsFetched, key, user]);

  return variant;
};

export const useAmplitudeVariantValue = (
  key: AmplitudeVariants,
  value: string,
) => useAmplitudeVariant(key)?.value === value;

export const setAmplitudeLocalOverride = (
  key: AmplitudeVariants,
  value: string,
) => {
  localStorage.setItem(`${key}-amplitude-override`, value);
};

export const getAmplitudeLocalOverride = (key: AmplitudeVariants) =>
  localStorage.getItem(`${key}-amplitude-override`) ?? undefined;

export const deleteAmplitudeLocalOverride = (key: AmplitudeVariants) => {
  localStorage.removeItem(`${key}-amplitude-override`);
};
