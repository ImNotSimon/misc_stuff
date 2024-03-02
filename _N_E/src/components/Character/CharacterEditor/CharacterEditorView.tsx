import { logError } from '@/analytics/analytics';
import { Form } from '@/components/ui/form';
import { AppToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCharacterEditorContext } from '@/context/CharacterEditorContext';
import { VoiceContextProvider } from '@/context/VoiceContext';
import { useWarnBeforeLeavePage } from '@/hooks/utils';
import { AppPaths } from '@/utils/appUtils';
import {
  useCreateCharacter,
  useUpdateCharacter,
} from '@character-tech/client-common/src/hooks/queries/character';
import { socialKeys } from '@character-tech/client-common/src/hooks/queries/social';
import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import { CharacterVisibility } from '@character-tech/client-common/src/types/types';
import { CharacterConstants } from '@character-tech/client-common/src/utils/characterUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { type z } from 'zod';
import { CharacterEditorForm } from './CharacterEditorForm';
import { Footer } from './Footer';
import { Header } from './Header';
import { CharacterEditorFormSchema } from './types';

export const CharacterEditorView = ({
  charData,
}: {
  charData?: CharacterDetailed;
}) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createOrUpdate: 'create' | 'update' = charData ? 'update' : 'create';

  const { mutate: createCharacter, isLoading: isLoadingCreateCharacter } =
    useCreateCharacter();
  const { mutate: updateCharacter, isLoading: isLoadingUpdateCharacter } =
    useUpdateCharacter();
  const isLoadingCreateOrUpdate =
    isLoadingCreateCharacter || isLoadingUpdateCharacter;

  const [voiceSelectionOpen, setVoiceSelectionOpen] = useState(false);

  const editingLocked = useMemo(
    () =>
      charData &&
      charData?.visibility === CharacterVisibility.PUBLIC &&
      charData?.num_interactions >
        CharacterConstants.MAX_INTERACTIONS_BEFORE_EDITING_DISABLED,
    [charData],
  );

  const defaultValues: FieldValues = useMemo(
    () => ({
      name: charData?.name ?? '',
      title: charData?.title ?? '',
      visibility: charData?.visibility ?? CharacterVisibility.PUBLIC,
      copyable: charData?.copyable ?? false, // deprecating remixes
      greeting: charData?.greeting ?? '',
      definition: charData?.definition ?? '',
      description: charData?.description ?? '',
      categories: charData?.categories.length
        ? charData?.categories.map((c) => c.name)
        : [],
      // avatar
      avatar_rel_path: charData?.avatar_file_name ?? '',
      // image
      img_gen_enabled: charData?.img_gen_enabled ?? false,
      base_img_prompt: charData?.base_img_prompt ?? '',
      strip_img_prompt_from_msg: charData?.strip_img_prompt_from_msg ?? false,
      // voice
      voice_id: '',
      default_voice_id: charData?.default_voice_id ?? '',
      // identifier
      external_id:
        createOrUpdate === 'create' ? undefined : charData?.external_id,
      identifier: createOrUpdate === 'create' ? `id:${uuidv4()}` : undefined, // TODO: why are we passing an identifier?
    }),
    [charData, createOrUpdate],
  );

  const form = useForm<z.infer<typeof CharacterEditorFormSchema>>({
    resolver: zodResolver(CharacterEditorFormSchema),
    mode: 'onSubmit',
    defaultValues,
    disabled: editingLocked,
  });
  const watchedFields = form.watch();

  useWarnBeforeLeavePage(
    form.formState.isDirty && !isLoadingCreateOrUpdate,
    t('Common.unsaved-changes-warning'),
  );

  const { setCharData } = useCharacterEditorContext();

  useEffect(() => {
    if (charData) {
      form.reset(defaultValues);
    }
    setCharData(charData);
  }, [charData, form, setCharData, form.reset, defaultValues]);

  const onSubmitSuccess = useCallback(
    (
      character: CharacterDetailed,
      values: z.infer<typeof CharacterEditorFormSchema>,
    ) => {
      AppToast(
        createOrUpdate === 'create'
          ? t('CharacterEditor.character-created')
          : t('CharacterEditor.character-updated'),
      );
      form.reset(values);
      if (user?.user?.username) {
        void queryClient.invalidateQueries(
          socialKeys.publicUser(user.user.username),
        );
      }
      router.push(AppPaths.chat(character.external_id), {
        referrer: 'CharacterEditorView',
        character_id: character.external_id,
      });
    },
    [createOrUpdate, form, user, queryClient, router],
  );

  const onSubmitError = useCallback(
    (error: unknown) => {
      AppToast(
        createOrUpdate === 'create'
          ? t('CharacterEditor.character-created-failed')
          : t('CharacterEditor.character-updated-failed'),
        undefined,
        'destructive',
      );
      logError('Failed to create or update character', { error });
    },
    [createOrUpdate],
  );

  const handleSubmit = useCallback(async () => {
    const isValid = await form.trigger(
      Object.keys(form.formState.defaultValues ?? {}) as (keyof z.infer<
        typeof CharacterEditorFormSchema
      >)[],
    );
    if (!isValid) {
      return;
    }
    const values = form.getValues();
    if (createOrUpdate === 'create') {
      createCharacter(
        // @ts-expect-error char endpoint expects array of category names and not array of CharacterCategory
        values as Partial<CharacterDetailed>,
        {
          onSuccess: (character) => onSubmitSuccess(character, values),
          onError: (error) => onSubmitError(error),
        },
      );
    } else {
      updateCharacter(
        // @ts-expect-error char endpoint expects array of category names and not array of CharacterCategory
        values as Partial<CharacterDetailed>,
        {
          onSuccess: (character) => onSubmitSuccess(character, values),
          onError: (error) => onSubmitError(error),
        },
      );
    }
  }, [
    createCharacter,
    updateCharacter,
    onSubmitError,
    onSubmitSuccess,
    createOrUpdate,
    form,
  ]);

  return (
    <VoiceContextProvider
      authToken={token}
      characterId={charData?.external_id ?? null}
      chatId={null}
      candidateId={null}
      onRequestVoice={() => setVoiceSelectionOpen(true)}
    >
      <div className="py-3 px-6 h-full flex flex-col items-center">
        <Header editingLocked={!!editingLocked} />
        <Form {...form}>
          <form className="h-full flex flex-col gap-4 justify-between items-center">
            <div className="flex flex-col flex-auto gap-4 sm:w-[480px] w-80">
              <CharacterEditorForm
                characterName={watchedFields.name ?? defaultValues.name}
                defaultVoiceId={
                  watchedFields.default_voice_id ??
                  defaultValues.default_voice_id
                }
                voiceSelectionOpen={voiceSelectionOpen}
                setVoiceSelectionOpen={setVoiceSelectionOpen}
              />
            </div>
            <Footer
              isSubmitLoading={isLoadingCreateOrUpdate}
              submitDisabled={!form.formState.isDirty}
              createOrUpdate={createOrUpdate}
              handleSubmit={handleSubmit}
            />
          </form>
        </Form>
      </div>
    </VoiceContextProvider>
  );
};
