import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';

let appsflyerReadyPromise: Promise<boolean> | null = null;
let sdkReady: boolean | null = null;

const isAppsflyerPresent = (): boolean =>
  !!window.AF &&
  !!window.AF_SDK &&
  !!window.AF_SDK.PLUGINS &&
  !!window.AF_SDK.PLUGINS.PBA;

/**
 * Centralizes the logic to wait for the Appsflyer SDK to be ready
 * @param timeout Maximum time to wait for the Appsflyer SDK to be ready
 * @returns
 */
const waitForAppsflyerSdkReady = (timeout = 2000): Promise<boolean> => {
  if (sdkReady === true) {
    return Promise.resolve(true);
  }
  if (sdkReady === false) {
    return Promise.reject(new Error('Appsflyer SDK not ready within timeout'));
  }
  if (!appsflyerReadyPromise) {
    appsflyerReadyPromise = new Promise((resolve, reject) => {
      const interval = 200;
      let elapsed = 0;

      const check = () => {
        if (isAppsflyerPresent()) {
          sdkReady = true;
          resolve(true);
        } else if (elapsed < timeout) {
          elapsed += interval;
          setTimeout(check, interval);
        } else {
          sdkReady = false;
          reject(new Error('Appsflyer SDK not ready within timeout'));
        }
      };

      check();
    });
  }

  return appsflyerReadyPromise;
};

const executeWhenAppsflyerReady = (action: () => void): void => {
  waitForAppsflyerSdkReady()
    .then(action)
    .catch(() => {});
};

/**
 * Set the customer user id for Appsflyer, used in cross-site attribution
 * @param userId Internal user id of user
 */
export const setAppsflyerCustomerId = (userId: string | null | undefined) => {
  executeWhenAppsflyerReady(() => {
    try {
      window.AF('pba', 'setCustomerUserId', userId || undefined);
    } catch {
      // fail open
    }
  });
};

/**
 * Toggle appsflyer measurement for the current user
 */
export const toggleAppsflyerMeasurement = (enable: boolean) => {
  executeWhenAppsflyerReady(() => {
    try {
      if (enable) {
        window.AF_SDK.PLUGINS.PBA.enableMeasurement();
      } else {
        window.AF_SDK.PLUGINS.PBA.disableMeasurement();
      }
    } catch {
      // fail open
    }
  });
};

/**
 * Show the Appsflyer Smart Banner if user is in the treatment group
 */
export const maybeShowBanner = (): void => {
  executeWhenAppsflyerReady(() => {
    try {
      const show = AmplitudeExperimentationFactory.checkAmplitudeVariantValue(
        AmplitudeVariants.SmartBanner,
        'treatment',
      );
      if (show) {
        window.AF('banners', 'showBanner');
      }
    } catch {
      // fail open
    }
  });
};

const appsflyerConversionEventsSet: Set<string> = new Set([
  AnalyticsEvents.Auth.SignupCompleted,
  AnalyticsEvents.Purchases.Complete,
  AnalyticsEvents.Search,
  AnalyticsEvents.User.SocialAction,
  AnalyticsEvents.User.ToSAcknowledged,
  AnalyticsEvents.User.CharacterUpdated,
  AnalyticsEvents.Links.Opened,
]);

/**
 * Log an event to Appsflyer, if the event is in the set of conversion events
 */
export const logEventToAppsflyer = (
  eventName: string,
  metadata?: Record<string, string | number | boolean | null> | null,
) => {
  if (!isAppsflyerPresent()) {
    return;
  }

  if (!appsflyerConversionEventsSet.has(eventName)) {
    return;
  }

  try {
    window.AF('pba', 'event', {
      eventType: 'EVENT',
      eventName,
      eventValue: {
        ...metadata,
      },
    });
  } catch {
    // fail open
  }
};
