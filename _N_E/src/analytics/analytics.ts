import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import {
  logEventToAppsflyer,
  maybeShowBanner,
  toggleAppsflyerMeasurement,
} from '@/analytics/appsflyer';
import { SENTRY_RELEASE } from '@/analytics/sentryRelease';
import { COOKIE_CONSENT } from '@/utils/constants';
import * as amplitude from '@amplitude/analytics-browser';
import { LogDebugError } from '@character-tech/client-common/dist/DebugLog';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { CaptureConsole, ExtraErrorData } from '@sentry/integrations';
import * as Sentry from '@sentry/react';
import Cookies from 'js-cookie';
import { type CookieConsentEnum } from '../types/types';

const DEFAULT_SAMPLE_RATE = 0.01;

// TODO (AG): Enable session replay based on some to-be-determined condition (e.g. annotators)
const ALLOW_REPLAY = false;
const REPLAY_ON_ERROR_SAMPLE_RATE = 0;
const REPLAY_SESSION_SAMPLE_RATE = 0;

let replay: Sentry.Replay;
if (ALLOW_REPLAY) {
  replay = new Sentry.Replay({
    maskAllText: true,
    blockAllMedia: true,
    maskAllInputs: true,
  });
}

export const tryInitAnalytics = async () => {
  initSentry();

  const cookieConsent = await getCookieConsent();
  if (cookieConsent === 'accept_all' || cookieConsent === 'not_applicable') {
    toggleAppsflyerMeasurement(true);
    maybeShowBanner();
  }
};

const createIntegrations = () => {
  const baseIntegrations = [
    new Sentry.BrowserTracing(),
    new CaptureConsole({ levels: ['error'] }),
    new ExtraErrorData({ depth: 9 }), // should be normalizeDepth - 1
  ];

  // Only add replay integration if it's enabled and available
  if (ALLOW_REPLAY && replay) {
    return [...baseIntegrations, replay];
  }
  return baseIntegrations;
};

const initSentry = () => {
  try {
    Sentry.init({
      release: SENTRY_RELEASE,
      debug: false,
      dsn: 'https://ec9642a19be21b8d99b816d70ffad372@o4504695552606208.ingest.sentry.io/4506384249389056',
      enabled: true,
      environment: process.env.NODE_ENV,
      tracesSampleRate: DEFAULT_SAMPLE_RATE,
      normalizeDepth: 10,
      replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
      replaysOnErrorSampleRate: REPLAY_ON_ERROR_SAMPLE_RATE,
      integrations: createIntegrations(),
    });
  } catch (error) {
    logError('Failed to initialize Sentry', { error });
  }
};

const canStartSessionReplay = (user: Participant | null) =>
  ALLOW_REPLAY && process.env.NODE_ENV === 'production' && user?.user?.is_staff;

export const maybeStartSessionReplay = (user: Participant | null) => {
  try {
    if (canStartSessionReplay(user) && replay) {
      replay.startBuffering();
    }
  } catch (error) {
    logError('Failed to start session replay', { error });
  }
};

export const endSessionReplay = () => {
  try {
    if (replay) {
      void replay.stop();
    }
  } catch (error) {
    logError('Failed to stop session replay', { error });
  }
};

export const updateSentryUser = (user: Participant | null) => {
  const userID = String(user?.user?.id);
  const email = user?.email;
  if (user === null) {
    Sentry.setUser(null);
  } else {
    console.debug(`Updated Sentry: user=${userID}, email=${email}`);
    Sentry.setUser({
      userID,
      email,
    });
  }
};

export interface AnalyticsProps {
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>;
}

const logEventToAmplitude = amplitude.track;

export const logAnalyticsEvent = (
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>,
) => {
  const props = properties ? JSON.parse(JSON.stringify(properties)) : null;
  logEventToAmplitude(eventName, props);
  logEventToAppsflyer(eventName, props);
};

export const logError = (
  description: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { error?: any; extra?: Record<string, any> },
) => {
  try {
    const { error, extra } = data || {};
    let id;
    let errorStr;
    if (error instanceof Error) {
      id = Sentry.captureException(error, {
        extra: { description, ...extra },
      });
      errorStr = error.toString();
    } else {
      id = Sentry.captureMessage(description, {
        extra: { error, ...extra },
        level: 'error',
      });
      errorStr = error ? JSON.stringify(error) : undefined;
    }
    logAnalyticsEvent(AnalyticsEvents.Error, {
      description,
      error: errorStr,
      ...data?.extra,
    });
    LogDebugError(description, error, extra);
    return id;
  } catch (error) {
    LogDebugError('Failed to report error to sentry', error);
  }
};

export const getCookieConsent = async (): Promise<CookieConsentEnum> => {
  const consentCookie = Cookies.get(COOKIE_CONSENT);
  if (consentCookie) {
    return consentCookie as CookieConsentEnum;
  }

  const userInEU = AmplitudeExperimentationFactory.checkAmplitudeVariantValue(
    AmplitudeVariants.IsEU,
    'treatment',
  );
  if (!userInEU) {
    // For non-EU users, we do not need to ask for consent
    setCookieConsent('not_applicable');
    return 'not_applicable';
  }

  return 'unset';
};

export const setCookieConsent = (value: CookieConsentEnum) => {
  Cookies.set(COOKIE_CONSENT, value, { expires: 365, path: '/' });
};
