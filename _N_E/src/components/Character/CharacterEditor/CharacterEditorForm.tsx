import { AvatarUploadField } from '@/components/User/AvatarUpload';
import { FormEnumButtonsField } from '@/components/ui/FormEnumButtonsField';
import { FormInputField } from '@/components/ui/FormInputField';
import { FormTextareaField } from '@/components/ui/FormTextareaField';
import {
  ChevronDownIcon,
  GlobeIcon,
  LinkIcon,
  LockIcon,
} from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  getSchemaChecks,
} from '@/components/ui/form';
import { useVoiceContext } from '@/context/VoiceContext';
import { VoiceSelectionView } from '@/views/chat/ChatVoice/ChatVoiceSelection';
import { useGenerateCharacterField } from '@character-tech/client-common/src/hooks/queries/character';
import { CharacterVisibility } from '@character-tech/client-common/src/types/types';
import * as Sentry from '@sentry/react';
import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { MoreOptions } from './MoreOptions';
import {
  CharacterEditorFormSchema,
  characterTooltipProps,
  type GenerateFieldParams,
} from './types';

export const renderVisibilityIcon = (visibility: CharacterVisibility) => {
  switch (visibility) {
    case CharacterVisibility.PUBLIC:
      return <GlobeIcon className="size-4" />;
    case CharacterVisibility.UNLISTED:
      return <LinkIcon className="size-4" />;
    case CharacterVisibility.PRIVATE:
      return <LockIcon className="size-4" />;
    default:
      return <div className="size-4" />;
  }
};

export const CharacterEditorForm = ({
  characterName,
  voiceSelectionOpen,
  setVoiceSelectionOpen,
  defaultVoiceId,
}: {
  characterName: string;
  voiceSelectionOpen: boolean;
  setVoiceSelectionOpen: (val: boolean) => void;
  defaultVoiceId?: string;
}) => {
  const { isTtsEnabledForCurrentUser, client } = useVoiceContext();
  const [isLoadingVoiceName, setIsLoadingVoiceName] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [openMoreOptions, setOpenMoreOptions] = useState(false);

  useEffect(() => {
    if (!defaultVoiceId) {
      setVoiceName('');
      return;
    }
    setIsLoadingVoiceName(true);
    void client
      ?.getVoiceFromId(defaultVoiceId)
      .then((voice) => {
        setIsLoadingVoiceName(false);
        setVoiceName(voice.name);
      })
      .catch((exception) => {
        setIsLoadingVoiceName(false);
        Sentry.captureException(exception);
      });
  }, [client, defaultVoiceId]);

  const {
    mutate: generateCharacterField,
    isLoading: isLoadingGenerateCharacterField,
  } = useGenerateCharacterField();

  const generateGreeting = useCallback(
    ({ onSuccess, onError }: GenerateFieldParams) => {
      generateCharacterField(
        {
          field_to_generate: 'greeting',
          num_candidates: 1,
          metadata: { name: characterName },
        },
        {
          onSuccess,
          onError,
        },
      );
    },
    [characterName, generateCharacterField],
  );

  const renderTrigger = (disabled = false) => (
    <Button
      className="w-full h-full py-2 rounded-spacing-s flex flex-start bg-surface-elevation-1 items-center"
      variant="ghost"
      onPress={() => disabled || setVoiceSelectionOpen(true)}
      isDisabled={disabled}
    >
      <div className="flex flex-col gap-1 h-full w-full items-start">
        <p className="text-sm font-medium">{t('CharacterEditor.Form.voice')}</p>
        <div className="flex flex-start w-full text-muted-foreground line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal">
          {isLoadingVoiceName
            ? t('Common.loading')
            : voiceName || t('Common.add')}
        </div>
      </div>
      <ChevronDownIcon className="h-4 w-4" />
    </Button>
  );

  return (
    <>
      <AvatarUploadField name="avatar_rel_path" username={characterName} />
      <FormInputField
        name="name"
        checks={getSchemaChecks(CharacterEditorFormSchema, 'name')}
        label={t('CharacterEditor.Form.character-name')}
        placeholder={t('CharacterEditor.Form.character-name-placeholder')}
        labelPosition="top"
        className="bg-background h-14"
        labelClassname="hover:no-underline"
      />
      <FormInputField
        name="title"
        checks={getSchemaChecks(CharacterEditorFormSchema, 'title')}
        label={t('CharacterEditor.Form.tagline')}
        placeholder={t('CharacterEditor.Form.tagline-placeholder')}
        tooltipProps={{
          ...characterTooltipProps,
          content: t('CharacterEditor.Form.tagline-tooltip'),
        }}
        labelPosition="top"
        className="bg-background h-14"
      />
      <FormTextareaField
        name="description"
        checks={getSchemaChecks(CharacterEditorFormSchema, 'description')}
        label={t('CharacterEditor.Form.description')}
        placeholder={t('CharacterEditor.Form.description-placeholder')}
        tooltipProps={{
          ...characterTooltipProps,
          content: t('CharacterEditor.Form.description-tooltip'),
        }}
        labelPosition="top"
        className="h-32 bg-background"
      />
      <FormTextareaField
        name="greeting"
        checks={getSchemaChecks(CharacterEditorFormSchema, 'greeting')}
        generateFieldProps={
          characterName
            ? {
                // need character name to generate a greeting
                onGenerate: generateGreeting,
                isLoading: isLoadingGenerateCharacterField,
              }
            : undefined
        }
        label={t('CharacterEditor.Form.greeting')}
        placeholder={t('CharacterEditor.Form.greeting-placeholder')}
        tooltipProps={{
          ...characterTooltipProps,
          content: t('CharacterEditor.Form.greeting-tooltip'),
        }}
        labelPosition="top"
        className="pr-4 bg-background min-h-20"
      />
      {!!isTtsEnabledForCurrentUser && (
        <FormField
          name="default_voice_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl className="w-full">
                <VoiceSelectionView
                  isOpen={voiceSelectionOpen}
                  onOpenChange={
                    field.disabled ? undefined : setVoiceSelectionOpen
                  }
                  selectedVoiceId={field.value}
                  selectVoice={(voiceId: string) => {
                    if (field.value === voiceId) {
                      field.onChange('');
                    } else {
                      field.onChange(voiceId);
                    }

                    setVoiceSelectionOpen(false);
                  }}
                  renderTrigger={() => renderTrigger(field.disabled)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
      <MoreOptions open={openMoreOptions} setOpen={setOpenMoreOptions} />
      <FormEnumButtonsField
        name="visibility"
        label={t('CharacterEditor.Form.visibility')}
        fieldEnumProps={Object.fromEntries(
          Object.keys(CharacterVisibility).map((v) => [
            v,
            {
              label: t(`Common.Visibility.${v.toLowerCase()}`),
              icon: renderVisibilityIcon(v as CharacterVisibility),
              details: t(`Common.Visibility.Details.${v.toLowerCase()}`),
            },
          ]),
        )}
      />
    </>
  );
};
