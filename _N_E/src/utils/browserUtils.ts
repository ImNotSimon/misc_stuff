import { logAnalyticsEvent } from '@/analytics/analytics';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { AppUtils } from './appUtils';

export const shareLink = async (
  url: string,
  shortTitle: string,
  detailedTitle?: string,
  referrer?: string,
) => {
  const href = AppUtils.getHref(url);
  const shareData = { title: detailedTitle ?? shortTitle, href };
  if (navigator.canShare && navigator.canShare(shareData)) {
    await navigator.share(shareData);
  } else {
    AppUtils.copyTextToClipboard(
      href,
      t('Share.share-link-copied', { title: shortTitle }),
      'shareLink',
    );
  }

  logAnalyticsEvent(AnalyticsEvents.User.SocialAction, {
    referrer: referrer || 'browserUtils',
    type: 'share',
    ...shareData,
  });
};
