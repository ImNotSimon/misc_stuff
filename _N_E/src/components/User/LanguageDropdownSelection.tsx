import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { DynamicDropdownMenu } from '@/components/ui/DynamicDropdownMenu';
import { ChevronDownIcon } from '@/components/ui/Icon';
import {
  getLanguage,
  getLanguageLabel,
  getLanguages,
  setLanguage,
} from '@/i18n/config';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';

export const LanguageDropdownSelection = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());

  const currentLanguageLabel = getLanguageLabel(currentLanguage);

  const handleUpdateLanguage = async (langValue: string) => {
    await setLanguage(langValue);
    logAnalyticsEvent(AnalyticsEvents.Settings.Changed, {
      setting: 'language',
      new_value: langValue,
      old_value: currentLanguage,
      referrer: 'LanguageDropdownSelection',
    });
    setCurrentLanguage(langValue);
    router.reload();
  };

  return (
    <DynamicDropdownMenu
      options={getLanguages().map((langElem) => ({
        content: (
          <Button
            variant="ghost"
            className="flex justify-start rounded-spacing-xs"
            onPress={async () => handleUpdateLanguage(langElem.value)}
          >
            {langElem.label}
          </Button>
        ),
        asChild: true,
        key: langElem.value,
      }))}
      setIsOpen={setOpen}
      isOpen={open}
      triggerClassName="opacity-100"
      contentClassName="overflow-y-auto max-h-[420px]"
      itemClassName="py-4 first:mt-2 last:mb-2"
    >
      <div
        className="h-fit text-muted-foreground py-3 px-4 border-1 border-accent rounded-spacing-m gap-2 flex flex-row justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col items-start">
          <p className="text-sm">{t('SettingsPreferences.language')}</p>
          <p className="text-primary">{currentLanguageLabel}</p>
        </div>
        <ChevronDownIcon height="20px" />
      </div>
    </DynamicDropdownMenu>
  );
};
