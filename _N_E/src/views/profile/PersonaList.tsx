import { ErrorView } from '@/components/Common/ErrorView';
import { Spinner } from '@/components/Common/Loader';
import { EMPTY_PERSONA } from '@/components/Persona/types';
import { useUserPersonas } from '@character-tech/client-common/src/hooks/queries/persona';
import { useUserSettings } from '@character-tech/client-common/src/hooks/queries/user';
import { t } from 'i18next';
import { useCallback } from 'react';
import { EditablePersonaDialog } from '../../components/Persona/EditablePersonaDialog';

export function PersonaList() {
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

  const isLoading = isLoadingPersonas || isLoadingSettings;
  const isError = isErrorPersonas || isErrorSettings;

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

  // should only ever be at most length one
  const defaultPersonas = (personas ?? []).filter(
    (p) => p.external_id === (settings ?? {}).default_persona_id,
  );
  const otherPersonas = (personas ?? []).filter(
    (p) => p.external_id !== (settings ?? {}).default_persona_id,
  );

  if (isLoading) {
    return <Spinner />;
  }
  if (isError || !personas) {
    return <ErrorView refresh={refetch} />;
  }
  return (
    <div className="w-full">
      {(personas ?? []).length === 0 && (
        <div className="flex w-full justify-center mb-2 mt-4">
          {t('Persona.create-persona')}
        </div>
      )}
      {defaultPersonas.map((p) => (
        <EditablePersonaDialog
          key={p.external_id}
          persona={p}
          settings={settings ?? {}}
          dialogTrigger="list-item"
        />
      ))}
      {otherPersonas.map((p) => (
        <EditablePersonaDialog
          key={p.external_id}
          persona={p}
          settings={settings ?? {}}
          dialogTrigger="list-item"
        />
      ))}
      <div className="flex w-full justify-center my-2">
        <EditablePersonaDialog
          persona={EMPTY_PERSONA}
          settings={settings ?? {}}
          dialogTrigger="new"
        />
      </div>
    </div>
  );
}
