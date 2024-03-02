import {
  getCookieConsent,
  logAnalyticsEvent,
  setCookieConsent,
} from '@/analytics/analytics';
import { toggleAppsflyerMeasurement } from '@/analytics/appsflyer';
import { Button } from '@/components/ui/button';
import { type CookieConsentEnum } from '@/types/types';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CookieConsent() {
  // start with true to avoid flickering
  const [hasConsented, setHasConsented] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    void (async () => {
      const consent = await getCookieConsent();
      setHasConsented(consent !== 'unset');
    })();
  }, []);

  const handleConsentPress = (consent: CookieConsentEnum) => {
    setCookieConsent(consent);
    if (consent === 'accept_all') {
      toggleAppsflyerMeasurement(true);
    }
    logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
      referrer: 'CookieConsent',
      value: consent,
    });
    setHasConsented(true);
  };

  if (hasConsented) {
    return null;
  }
  return (
    <div className="fixed inset-x-0 bottom-0 md:absolute md:bottom-16 md:right-4 md:left-auto w-full md:max-w-64 shadow-sm bg-surface-elevation-3 p-4 rounded-spacing-xs text-sm z-50">
      <p>{t('CookieConsent.header-text')}</p>
      <br />
      <p>{t('CookieConsent.subtext')}</p>
      <div className="flex gap-2 mt-2 w-full">
        <Button
          className="w-full"
          variant="ghost"
          onPress={() => {
            handleConsentPress('reject_all');
          }}
        >
          {t('CookieConsent.reject-all')}
        </Button>
        <Button
          className="bg-surface-elevation-2 w-full"
          variant="ghost"
          onPress={() => {
            handleConsentPress('accept_all');
          }}
        >
          {t('CookieConsent.accept-all')}
        </Button>
      </div>
    </div>
  );
}
