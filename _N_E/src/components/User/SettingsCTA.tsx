import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { DISCORD_HREF } from '@character-tech/client-common/src/utils/constants';
import { t } from 'i18next';
import { BsDiscord } from 'react-icons/bs';
import { GetTheAppDialog } from './GetTheAppDialog';
import { SettingsButton } from './SettingsButton';

export const SettingsCTA = ({ className }: { className: string }) => (
  <div className={className}>
    <LinkWithAnalytics
      href={DISCORD_HREF}
      target="_blank"
      analyticsProps={{
        eventName: AnalyticsEvents.Links.Opened,
        properties: {
          referrer: 'SettingsDialog',
          link: DISCORD_HREF,
        },
      }}
    >
      <SettingsButton
        highlighted
        icon={<BsDiscord color="#5865F2" size="1.5rem" />}
      >
        {t('Settings.discord')}
      </SettingsButton>
    </LinkWithAnalytics>
    <GetTheAppDialog />
  </div>
);
