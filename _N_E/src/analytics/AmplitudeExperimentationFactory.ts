import { SENTRY_RELEASE } from '@/analytics/sentryRelease';
import { SiteVariantPlugin } from '@/analytics/siteVariantPlugin';
import { getLanguage } from '@/i18n/config';
import { amplitudeFetchedSignal } from '@/lib/state/signals';
import {
  add,
  Identify,
  identify,
  init,
  setUserId,
  Types,
} from '@amplitude/analytics-browser';
import {
  Experiment,
  type ExperimentClient,
  type Variant,
} from '@amplitude/experiment-js-client';
import { LogDebugError } from '@character-tech/client-common/dist/DebugLog';
import {
  type Participant,
  type Subscription,
} from '@character-tech/client-common/src/types/app-api';

export const AMPLITUDE_API_KEY = '39bbdcaee6ca6e36cb5f9b1b7735801c';
export const AMPLITUDE_DEPLOYMENT_KEY =
  'client-WVv19zETpzXjyUbf7CbKs56ovwz8mjAi';

export class AmplitudeExperimentationFactory {
  static experiment: ExperimentClient | undefined;

  static updateAmplitudeIdentify = async (user: Participant | null) => {
    const userID = String(user?.user?.id);
    if (userID) {
      setUserId(userID);
    }

    const userIdentify = getUserIdentity(user);
    console.debug(`Updated Amplitude: user=${userID}`);

    try {
      await identify(userIdentify).promise;
      // setUserId & identify will both fetch experiments if automaticFetchOnAmplitudeIdentityChange is true
      // amplitude recommend we don't use that feature and instead fetch experiments manually once we've updated everything
      await this.experiment?.fetch();
      // set the signal to true to indicate that the amplitude experiments have been fetched
      amplitudeFetchedSignal.value = Date.now();
    } catch (error) {
      console.error('Failed to update Amplitude identity', error);
    }
  };

  static setUserProperty = async (
    name: string,
    value: Types.ValidPropertyType,
  ) => {
    const userIdentify = new Identify();
    userIdentify.set(name, value);
    try {
      await identify(userIdentify).promise;
    } catch (error) {
      LogDebugError('Failed to append user property');
    }
  };

  static initAmplitude = () => {
    add(new SiteVariantPlugin());
    init(AMPLITUDE_API_KEY, {
      defaultTracking: true,
      logLevel: Types.LogLevel.None, // Update if debugging events
      minIdLength: 1,
      serverUrl: 'https://events.character.ai/2/httpapi',
    });

    this.experiment = Experiment.initializeWithAmplitudeAnalytics(
      AMPLITUDE_DEPLOYMENT_KEY,
      {
        retryFetchOnFailure: true,
        serverUrl: 'https://exp.character.ai',
      },
    );
  };

  static getAmplitudeVariant = (key: AmplitudeVariants): Variant | undefined =>
    this.experiment?.variant(key);

  static getAmplitudeVariantPayload = (key: AmplitudeVariants) =>
    this.getAmplitudeVariant(key)?.payload ?? {};

  static checkAmplitudeVariantValue = (
    key: AmplitudeVariants,
    expectedValue: string,
  ) => this.getAmplitudeVariant(key)?.value === expectedValue;

  static checkAmplitudeGate = (key: AmplitudeVariants, fallback = false) => {
    const variant = this.getAmplitudeVariant(key);
    return variant ? variant.value === 'on' : fallback;
  };
}

// Add your variants here
export enum AmplitudeVariants {
  AnnotationTool = 'annotation-tool',
  Voice = 'voice-web',
  WebNext = 'webnext',
  SmartBanner = 'appsflyer-smart-banner',
  HeroScenarios = 'web-next-hero-scenarios',
  PinnedMessages = 'pinned-messages',
  MigrateLegacyChats = 'migrate-enabled',
  IsEU = 'eu-user',
  AlternateChatStyles = 'alt-chat-style',
}

const getUserIdentity = (user: Participant | null) => {
  const userIdentify = new Identify();

  const isStaff = user?.user?.is_staff || false;
  userIdentify.set('isStaff', isStaff);

  const email = user?.email;
  if (email) {
    userIdentify.set('email', email);
  }

  const username = user?.user?.username;
  if (username) {
    userIdentify.set('username', username);
  }

  const subscription = getUsersSubscription(user?.user?.subscription);
  userIdentify.set('subscription', subscription);

  userIdentify.set('selectedLanguage', getLanguage() || 'en');

  if (SENTRY_RELEASE) {
    userIdentify.set('bundleVersion', SENTRY_RELEASE);
  }

  return userIdentify;
};

const getUsersSubscription = (sub?: Subscription) => {
  const active = !!sub && new Date(sub.expires_at) > new Date();
  return active ? sub.type : 'NONE';
};
