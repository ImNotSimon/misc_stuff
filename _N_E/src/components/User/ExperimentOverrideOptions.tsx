/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { AmplitudeVariants } from '@/analytics/AmplitudeExperimentationFactory';
import {
  deleteAmplitudeLocalOverride,
  getAmplitudeLocalOverride,
  setAmplitudeLocalOverride,
  useAmplitudeVariant,
} from '@/analytics/analyticsHooks';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export const ExperimentOverrideOptions = () => {
  const experiments = Object.values(AmplitudeVariants).map((x: string) => ({
    key: x,
    override: getAmplitudeLocalOverride(x as AmplitudeVariants),
  }));

  return (
    <div className="grid w-full">
      <div className="flex flex-col gap-4 w-full">
        {experiments.map((x) => (
          <div key={x.key} className="flex items-center space-x-2 w-full">
            <ExperimentOverrideInput
              experiment={x.key}
              override={x.override ?? ''}
              setOverride={(val) =>
                setAmplitudeLocalOverride(x.key as AmplitudeVariants, val)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ExperimentOverrideInput = ({
  experiment,
  override,
  setOverride,
}: {
  experiment: string;
  override: string;
  setOverride: (val: string) => void;
}) => {
  const [value, setValue] = useState(override);
  const placeholder = useAmplitudeVariant(experiment as AmplitudeVariants);
  useEffect(() => {
    setOverride(override);
  }, [override, setOverride]);

  return (
    <Input
      label={experiment}
      placeholder={placeholder?.value}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (e.target.value) {
          setAmplitudeLocalOverride(
            experiment as AmplitudeVariants,
            e.target.value,
          );
        } else {
          deleteAmplitudeLocalOverride(experiment as AmplitudeVariants);
        }
      }}
    />
  );
};
