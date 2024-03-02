import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';

export const isTtsEnabled = () => {
  const payload = AmplitudeExperimentationFactory.getAmplitudeVariantPayload(
    AmplitudeVariants.Voice,
  );
  return !!payload.tts;
};
