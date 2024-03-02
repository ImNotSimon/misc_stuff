import { ExperimentOverrideOptions } from '@/components/User/ExperimentOverrideOptions';
import { settingsDialogOpenSignal } from '@/lib/state/signals';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useSignalValue } from 'signals-react-safe';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AccountOptions } from './AccountOptions';
import { PreferencesOptions } from './PreferencesOption';
import { ProfileForm } from './ProfileForm';
import { SettingsCTA } from './SettingsCTA';

type SettingsTabValues = 'profile' | 'account' | 'exp' | 'preferences';

const SettingsTabContent = ({
  tabValue,
  header,
  children,
}: {
  tabValue: SettingsTabValues;
  header: string;
  children: React.ReactNode;
}) => (
  <TabsContent
    value={tabValue}
    className="w-full h-full flex-auto p-5 pt-0 sm:pt-8 flex flex-col mt-4 sm:mt-0 items-center"
  >
    <div className="w-full flex justify-start ml-4">
      <DialogHeader className="mb-10 hidden sm:flex">{header}</DialogHeader>
    </div>
    <div className="w-96 sm:w-full h-full flex justify-center">{children}</div>
  </TabsContent>
);

export function SettingsDialog({ user }: { user: Participant | null }) {
  const open = useSignalValue(settingsDialogOpenSignal);

  const tabValues: SettingsTabValues[] = useMemo(() => {
    const lst: SettingsTabValues[] = ['profile'];
    if (user) {
      lst.push('account');
    }

    if (user?.user?.is_staff === true) {
      lst.push('exp');
    }
    lst.push('preferences');
    return lst;
  }, [user]);

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        settingsDialogOpenSignal.value = openValue;
      }}
      analyticsProps={{ referrer: 'Settings', type: 'SettingsDialog' }}
    >
      <DialogTrigger className="w-full" asChild />
      <DialogContent className="p-0 h-[624px] max-h-[80%] w-[708px] min-w-[400px] overflow-y-auto flex flex-col justify-between sm:flex-row">
        <Tabs
          defaultValue="profile"
          className="w-full h-full flex flex-col sm:flex-row"
          tabIndex={-1}
        >
          <TabsList className="h-fit sm:h-full mt-8 sm:mt-0 flex flex-col justify-start sm:justify-between items-center p-5 sm:pt-8 w-full sm:max-w-60 sm:w-[55%] overflow-hidden border-b-accent border-b-1 sm:border-b-none sm:border-b-0 sm:border-r-1 sm:border-r-accent">
            <div className="h-fit w-full mb-2 sm:mb-0 flex flex-row sm:flex-col gap-2 items-start">
              {tabValues.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="py-2 data-[state=active]:bg-accent focus-visible:text-primary rounded-spacing-s w-full flex justify-center sm:justify-start outline-none border-b-0 data-[state=active]:border-b-0 data-[state=active]:shadow-none"
                >
                  {t(`Settings.${value}`)}
                </TabsTrigger>
              ))}
            </div>
            <SettingsCTA className="hidden w-full sm:flex sm:flex-col gap-2" />
          </TabsList>

          <SettingsTabContent tabValue="profile" header={t('Settings.profile')}>
            <ProfileForm />
          </SettingsTabContent>
          {!!user && (
            <SettingsTabContent
              tabValue="account"
              header={t('Settings.account')}
            >
              <AccountOptions user={user} />
            </SettingsTabContent>
          )}
          <SettingsTabContent
            tabValue="preferences"
            header={t('Settings.preferences')}
          >
            <PreferencesOptions />
          </SettingsTabContent>
          <SettingsTabContent tabValue="exp" header={t('Settings.exp')}>
            <ExperimentOverrideOptions />
          </SettingsTabContent>
        </Tabs>
        <div className="flex sm:hidden bottom-0 h-fit justify-center p-4 border-t-accent border-t-1">
          <SettingsCTA className="flex gap-2 items-center" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
