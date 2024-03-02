import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { DarkModeIcon, LightModeIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { ThemeMode } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { useTheme } from 'next-themes';

const ModeIcon = ({ mode }: { mode: ThemeMode }) => {
  switch (mode) {
    case ThemeMode.light:
      return <LightModeIcon height="16px" />;
    default:
      return <DarkModeIcon height="16px" />;
  }
};

export const ThemeModeSelection = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {t('SettingsPreferences.theme')}
      </p>
      <div className="flex flex-row gap-4 justify-center">
        {Object.values(ThemeMode).map((thisMode) => (
          <Button
            key={thisMode}
            className={cn('rounded-spacing-s px-5 w-32', {
              'border-accent': thisMode !== theme,
            })}
            variant={thisMode === theme ? 'primary' : 'outline'}
            onPress={() => {
              setTheme(thisMode);
              logAnalyticsEvent(AnalyticsEvents.Settings.Changed, {
                referrer: 'ThemeModeSelection',
                setting: 'theme',
                value: thisMode,
              });
            }}
          >
            <ModeIcon mode={thisMode} /> {t(`SettingsPreferences.${thisMode}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
