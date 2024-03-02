import { logAnalyticsEvent, logError } from '@/analytics/analytics';
import { ErrorView } from '@/components/Common/ErrorView';
import { PersonaListItem } from '@/components/Persona/PersonaListItem';
import { isActivePersona } from '@/components/Persona/types';
import { ProfileFilledIcon } from '@/components/ui/Icon';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { AppToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useUserPersonas } from '@character-tech/client-common/src/hooks/queries/persona';
import {
  useUpdateUserSettings,
  useUserSettings,
} from '@character-tech/client-common/src/hooks/queries/user';
import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { PersonaOverrideDialogTrigger } from './PersonaOverrideDialogTrigger';

export interface PersonaOverrideDialogCoreProps {
  isLoading: boolean;
  open: boolean;
  setOpen: (val: boolean) => void;
  activePersonas: CharacterDetailed[];
  inactivePersonas: CharacterDetailed[];
  isError: boolean;
  refetch: () => void;
  handleNavigatePersona: (val: string) => void;
  handleSelect: (val: string) => void;
}

export function PersonaOverrideDialogCore({
  isLoading,
  open,
  setOpen,
  activePersonas,
  inactivePersonas,
  isError,
  refetch,
  handleNavigatePersona,
  handleSelect,
}: PersonaOverrideDialogCoreProps) {
  const { user } = useAuth();

  if (isLoading || !user) {
    return null;
  }
  if (!isLoading && activePersonas.length + inactivePersonas.length === 0) {
    return (
      <Button
        variant="ghost"
        className="flex justify-between w-fit"
        onPress={() => handleNavigatePersona('new')}
      >
        <ProfileFilledIcon className="mr-2 size-5" />
        {t('Common.persona')}
      </Button>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer: 'Persona', type: 'PersonaOverrideDialog' }}
    >
      <PersonaOverrideDialogTrigger
        activePersonas={activePersonas}
        setOpen={setOpen}
      />
      <DialogContent
        hideClose
        className="flex-auto flex flex-col justify-between w-[440px] max-h-[560px] gap-2 pt-0"
      >
        <div className="w-full flex justify-between sticky top-0 bg-popover z-10 pt-4">
          <div className="flex gap-4 items-center">
            <DialogClose>
              <X className="h-4 w-4" />
              <span className="sr-only">{t('Common.close')}</span>
            </DialogClose>
            <p>{t('Common.persona')}</p>
          </div>
          <Button
            variant="ghost"
            className="border-muted-foreground border"
            onPress={() => handleNavigatePersona('new')}
          >
            {t('Common.new')}
          </Button>
        </div>
        <div className="w-full h-full overflow-y-auto">
          {isError ? (
            <ErrorView refresh={refetch} />
          ) : (
            <>
              {activePersonas.map((p) => (
                <PersonaListItem
                  key={p.external_id}
                  persona={p}
                  isDefault={false} // don't show in UI
                  selected
                  handleEditClick={() => handleNavigatePersona(p.external_id)}
                  handleItemClick={() => handleSelect(p.external_id)}
                />
              ))}
              {inactivePersonas.map((p) => (
                <PersonaListItem
                  key={p.external_id}
                  persona={p}
                  isDefault={false}
                  handleEditClick={() => handleNavigatePersona(p.external_id)}
                  handleItemClick={() => handleSelect(p.external_id)}
                  selected={false}
                />
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PersonaOverrideDialog({
  characterId,
}: {
  characterId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const {
    personas,
    isLoading: isLoadingPersonas,
    isError: isErrorPersonas,
    refetch: refetchUserPersonas,
  } = useUserPersonas();
  const {
    settings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    refetch: refetchUserSettings,
  } = useUserSettings();
  const { mutate: updateSettings } = useUpdateUserSettings();

  const isLoading = isLoadingPersonas || isLoadingSettings;
  const isError = isErrorPersonas || isErrorSettings;

  const activePersonas = (personas ?? []).filter((p) =>
    isActivePersona(p.external_id, characterId, settings),
  );
  const inactivePersonas = (personas ?? []).filter(
    (p) => !isActivePersona(p.external_id, characterId, settings),
  );

  const refetch = useCallback(async () => {
    if (isErrorPersonas) {
      await refetchUserPersonas();
    }
    if (isErrorSettings) {
      await refetchUserSettings();
    }
  }, [
    isErrorPersonas,
    refetchUserPersonas,
    isErrorSettings,
    refetchUserSettings,
  ]);

  const handleNavigatePersona = (id: string) => {
    if (user?.user?.username) {
      void router.push(
        AppPaths.profile(user.user.username, 'personas', {
          id,
        }),
        { referrer: 'PersonaOverrideDialog' },
      );
    }

    setOpen(false);
  };

  const handleError = (error: unknown) => {
    AppToast(t('Error.something-went-wrong'), undefined, 'destructive');
    logError('Failed to enable/disable persona-for-this-character', { error });
  };

  const handleSelect = (personaId: string) => {
    const newPersonaOverrides = {
      ...(settings?.personaOverrides ?? {}),
      [characterId]: isActivePersona(personaId, characterId, settings)
        ? ''
        : personaId,
    };
    updateSettings(
      {
        ...settings,
        personaOverrides: newPersonaOverrides,
      },
      {
        onSuccess: (result: unknown) => {
          if (
            !result ||
            (result as { status: string; error: unknown }).status === 'NOT_OK'
          ) {
            handleError(
              (result as { status: string; error: unknown })?.error ||
                'Failed to update settings',
            );
            return;
          }
          logAnalyticsEvent(AnalyticsEvents.Settings.Changed, {
            setting: 'persona_updated',
            referrer: 'PersonaOverrideDialog',
            character_id: characterId,
            value: newPersonaOverrides[characterId] ?? '',
          });
          AppToast(t('Common.success'));
          setOpen(false);
        },
        onError: handleError,
      },
    );
  };

  return (
    <PersonaOverrideDialogCore
      isLoading={isLoading}
      open={open}
      setOpen={setOpen}
      activePersonas={activePersonas}
      inactivePersonas={inactivePersonas}
      isError={isError}
      refetch={refetch}
      handleNavigatePersona={handleNavigatePersona}
      handleSelect={handleSelect}
    />
  );
}
