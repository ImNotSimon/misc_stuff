import { AmplitudeExperimentationFactory } from '@/analytics/AmplitudeExperimentationFactory';
import { logAnalyticsEvent, logError } from '@/analytics/analytics';
import { type PersonaFormSchema } from '@/components/Persona/types';
import { AppToast } from '@/components/ui/use-toast';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import {
  PERSONA_LIMIT_ERROR_KEY,
  PERSONA_NAME_MAX_LIMIT_KEY,
  PERSONA_NAME_MIN_LIMIT_KEY,
  useCreatePersona,
  useUpdatePersona,
} from '@character-tech/client-common/src/hooks/queries/persona';
import { useUpdateUserSettings } from '@character-tech/client-common/src/hooks/queries/user';
import {
  type CharacterDetailed,
  type UserSettings,
} from '@character-tech/client-common/src/types/app-api';
import { t, type TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { type FieldValues } from 'react-hook-form';
import { type z } from 'zod';

const PERSONA_VALIDITY_ERROR_KEY =
  'Property exceeds max length or has invalid characters';
const CHARACTER_VALIDITY_ERROR_KEY =
  'Character property exceeds max length or has invalid characters';

// when creating or updating a persona, we may need to make changes to two objects
// (1) the actual persona object itself (i.e. character object with is_persona is true)
// (2) the user settings object to enable/disable the persona globally or as an override for a character

export const isErrorMessageKey = (message: string) =>
  [
    PERSONA_LIMIT_ERROR_KEY,
    PERSONA_NAME_MAX_LIMIT_KEY,
    PERSONA_NAME_MIN_LIMIT_KEY,
  ].includes(message ?? '');

export const onCreatePersonaSuccess = () => {
  logAnalyticsEvent(AnalyticsEvents.User.PersonaUpdated, {
    referrer: 'persona_hook',
    type: 'create',
  });
  AppToast(t('Persona.create-persona-success').toString());
};

export const onPersonaError = (
  error: unknown,
  action: 'create' | 'update' | 'delete',
) => {
  if (action === 'delete') {
    AppToast(
      t('Persona.failed-to-delete-persona').toString(),
      undefined,
      'destructive',
    );
    logError('Failed to delete persona', { error });
    return;
  }
  if (isErrorMessageKey((error as { message: string })?.message ?? '')) {
    AppToast(
      t(`Persona.${(error as { message: string }).message}`).toString(),
      undefined,
      'destructive',
    );
  } else if (
    [PERSONA_VALIDITY_ERROR_KEY, CHARACTER_VALIDITY_ERROR_KEY].includes(
      error as string,
    )
  ) {
    AppToast(
      t('Persona.failed-to-create-invalid-characters-persona').toString(),
      undefined,
      'destructive',
    );
  } else {
    AppToast(
      t(`Persona.failed-to-${action}-persona`).toString(),
      undefined,
      'destructive',
    );
  }

  logError(`Failed to ${action} persona`, { error });
};

export const onUpdatePersonaSuccess = (
  personaChanges: Record<string, string | boolean>,
) => {
  const isDelete = personaChanges.archived;
  if (isDelete) {
    logAnalyticsEvent(AnalyticsEvents.User.PersonaUpdated, {
      referrer: 'persona_hook',
      type: 'delete',
    });
  } else {
    logAnalyticsEvent(AnalyticsEvents.User.PersonaUpdated, {
      referrer: 'persona_hook',
      type: 'update',
      changes: personaChanges,
    });
  }

  AppToast(
    isDelete
      ? t('Persona.remove-persona-success').toString()
      : t('Persona.update-persona-success').toString(),
  );
};

interface PersonaHookProps {
  persona: CharacterDetailed;
  settings: UserSettings;
  onSuccessCallback: () => void;
  avatarFilenameFallback?: string;
}

const sanitizeFieldValues = (changes: z.infer<typeof PersonaFormSchema>) => {
  const { name, definition } = changes;
  return {
    ...changes,
    name: name.trim(),
    definition: definition?.trim(),
  };
};

export const usePersonaHook = ({
  persona,
  settings,
  onSuccessCallback,
  avatarFilenameFallback,
}: PersonaHookProps) => {
  const initialValues: FieldValues = useMemo(() => {
    const alreadyEnabled =
      settings.default_persona_id === persona.external_id &&
      !!persona &&
      !!settings.default_persona_id;

    return {
      name: persona.participant__name ?? '',
      definition: persona.definition ?? '',
      avatar_rel_path: persona.avatar_file_name || avatarFilenameFallback,
      enabled: !!alreadyEnabled,
    } as FieldValues;
  }, [avatarFilenameFallback, settings.default_persona_id, persona]);

  const { mutate: createPersona, isLoading: isLoadingCreatePersona } =
    useCreatePersona();
  const { mutate: updatePersona, isLoading: isLoadingUpdatePersona } =
    useUpdatePersona(persona);
  const { mutate: updateSettings, isLoading: isLoadingUpdateSettings } =
    useUpdateUserSettings();

  const onUpdateSettingsSuccess = useCallback(
    (enabled: boolean, isDelete?: boolean) => {
      logAnalyticsEvent(AnalyticsEvents.Settings.Changed, {
        setting: 'persona_enabled',
        referrer: 'persona_hook',
        value: enabled && !isDelete,
      });
      void AmplitudeExperimentationFactory.setUserProperty(
        'enabled_persona',
        enabled && !isDelete,
      );
    },
    [],
  );

  const handleSettingsUpdate = useCallback(
    async (
      external_id: string,
      createOrUpdate: 'create' | 'update' | 'delete',
      enabledFieldValue: boolean,
    ) => {
      const personaOverrides = settings.personaOverrides ?? {};

      const isDelete = createOrUpdate === 'delete';
      const defaultIsDeleted = settings.default_persona_id === external_id;
      const overrideIsDeleted =
        Object.values(personaOverrides).includes(external_id);

      // if we're deleting a persona that is not a default persona or in
      // any of the overrides, then we don't have to do anything with our
      // settings. we can just return the success message
      if (isDelete && !defaultIsDeleted && !overrideIsDeleted) {
        // then we might need to clear personaoverrides
        AppToast(t('Persona.remove-persona-success').toString());
        onSuccessCallback();
      } else {
        let newSettings = {
          ...settings,
          //  set default persona empty string if we are disabling as default
          default_persona_id: enabledFieldValue ? external_id : '',
        };
        if (isDelete) {
          // if a character has a persona override that is being deleted, just remove the
          // character from the overrides mapping
          const newPersonaOverrides = Object.entries({
            ...personaOverrides,
          }).reduce(
            (acc, [charId, value]) => {
              if (value !== persona.external_id) {
                acc[charId] = value;
              }
              return acc;
            },
            {} as {
              [characterId: string]: string | undefined;
            },
          );

          newSettings = {
            ...settings,
            // we only clear default_persona_id if the persona that is being deleted is the default persona
            default_persona_id: defaultIsDeleted
              ? ''
              : settings.default_persona_id ?? '',
            personaOverrides: newPersonaOverrides,
          };
        }
        updateSettings(newSettings, {
          onSuccess: async () => {
            onUpdateSettingsSuccess(enabledFieldValue, isDelete);
            AppToast(
              createOrUpdate === 'create'
                ? t('Persona.create-persona-success').toString()
                : t('Persona.update-persona-success').toString(),
            );
            onSuccessCallback();
          },
          onError: (error) => {
            // if they reach this point, they will have already successfully created/updated a persona
            // so we only need to tel them that setting the persona as the default failed
            AppToast(
              t('Persona.failed-to-enable-disable-persona', {
                action: enabledFieldValue ? 'enable' : 'disable',
              }).toString(),
              undefined,
              'destructive',
            );

            logError('Failed to enable/disable persona', { error });
          },
        });
      }
    },
    [
      onSuccessCallback,
      onUpdateSettingsSuccess,
      persona.external_id,
      settings,
      updateSettings,
    ],
  );

  const handleMutateSuccess = useCallback(
    async (
      createOrUpdate: 'create' | 'update' | 'delete',
      onSuccessFn: (t: TFunction) => void,
      enabledFieldValue: boolean,
      result?: {
        status?: string;
        isDelete?: boolean;
        persona: CharacterDetailed;
        error?: string;
      },
    ) => {
      const hasSettingChanges = initialValues.enabled !== enabledFieldValue;

      if (!result || !result.persona || result?.status === 'NOT_OK') {
        onPersonaError(
          result?.error ?? `Failed to ${createOrUpdate} your persona`,
          createOrUpdate,
        );
        return;
      }
      if (hasSettingChanges || createOrUpdate === 'delete') {
        await handleSettingsUpdate(
          result.persona.external_id,
          createOrUpdate,
          enabledFieldValue,
        );
      } else {
        onSuccessFn(t);
        onSuccessCallback();
      }
    },
    [initialValues.enabled, handleSettingsUpdate, onSuccessCallback],
  );

  const handleSaveChanges = useCallback(
    async (
      rawFieldValues: z.infer<typeof PersonaFormSchema>,
      createOrUpdate: 'create' | 'update',
    ) => {
      const sanitizedChanges = sanitizeFieldValues(rawFieldValues);
      const enabledFieldValue = rawFieldValues.enabled;

      const hasPersonaChanges = ['definition', 'name', 'avatar_rel_path'].some(
        (key) => initialValues[key] !== (sanitizedChanges as FieldValues)[key],
      );
      const hasSettingChanges =
        initialValues.enabled !== sanitizedChanges.enabled;

      if (createOrUpdate === 'create') {
        createPersona(sanitizedChanges, {
          onError: (error) => onPersonaError(error, 'create'),
          onSuccess: async (result) =>
            handleMutateSuccess(
              'create',
              onCreatePersonaSuccess,
              enabledFieldValue,
              result,
            ),
        });
      } else if (hasPersonaChanges) {
        updatePersona(
          {
            external_id: persona.external_id,
            changes: sanitizedChanges,
          },
          {
            onError: (error) => onPersonaError(error, 'update'),
            onSuccess: async (result) =>
              handleMutateSuccess(
                'update',
                () => onUpdatePersonaSuccess(sanitizedChanges),
                enabledFieldValue,
                result,
              ),
          },
        );
      } else if (hasSettingChanges) {
        // we want to display as if the persona were updated given the ux
        await handleSettingsUpdate(
          persona.external_id,
          'update',
          enabledFieldValue,
        );
      } else {
        AppToast(
          t('Persona.failed-to-enable-disable-persona', {
            action: enabledFieldValue ? 'enable' : 'disable',
          }).toString(),
          undefined,
          'destructive',
        );
      }
    },
    [
      createPersona,
      handleMutateSuccess,
      handleSettingsUpdate,
      initialValues,
      persona.external_id,
      updatePersona,
    ],
  );

  const handleDelete = useCallback(() => {
    updatePersona(
      {
        external_id: persona.external_id,
        changes: {
          archived: true,
          // need to do this since name isn't returned directly
          name: persona.participant__name,
        } as Partial<CharacterDetailed>,
      },
      {
        onError: (error) => onPersonaError(error, 'delete'),
        onSuccess: (result) =>
          handleMutateSuccess(
            'delete',
            () => onUpdatePersonaSuccess({ archived: true }),
            settings.default_persona_id === persona.external_id,
            result,
          ),
      },
    );
  }, [
    updatePersona,
    persona.external_id,
    persona.participant__name,
    handleMutateSuccess,
    settings.default_persona_id,
  ]);

  return {
    isLoading:
      isLoadingCreatePersona ||
      isLoadingUpdatePersona ||
      isLoadingUpdateSettings,
    initialValues,
    handleDelete,
    handleSaveChanges,
  };
};
