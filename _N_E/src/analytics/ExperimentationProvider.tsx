import { setAppsflyerCustomerId } from '@/analytics/appsflyer';
import { useAuth } from '@/context/AuthContext';
import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { AmplitudeExperimentationFactory } from './AmplitudeExperimentationFactory';
import {
  maybeStartSessionReplay,
  tryInitAnalytics,
  updateSentryUser,
} from './analytics';

export function ExperimentationProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement | null {
  const [amplitudeInitialized, setAmplitudeInitialized] = useState(false);
  const { user } = useAuth();
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    AmplitudeExperimentationFactory.initAmplitude();
    setAmplitudeInitialized(true);
    void tryInitAnalytics();
  }, []);

  useEffect(() => {
    const currentUserId = user?.user?.id ? String(user.user.id) : null;
    if (currentUserId !== prevUserId.current) {
      // Amplitude
      void AmplitudeExperimentationFactory.updateAmplitudeIdentify(user);

      // Appsflyer
      setAppsflyerCustomerId(currentUserId);

      // Sentry
      updateSentryUser(user);
      maybeStartSessionReplay(user);

      prevUserId.current = currentUserId;
    }
  }, [user]);

  if (!amplitudeInitialized) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
