import { PersonaListItem } from '@/components/Persona/PersonaListItem';
import { AvatarUploadField } from '@/components/User/AvatarUpload';
import { BrainIcon, ProfileFilledIcon } from '@/components/ui/Icon';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { usePersonaHook } from '@/hooks/personaHook';
import { usePersonaMenuOptions } from '@/hooks/personaMenuOption';
import { useGetPublicUser } from '@character-tech/client-common/src/hooks/queries/social';
import {
  type CharacterDetailed,
  type UserSettings,
} from '@character-tech/client-common/src/types/app-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { X } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { useHash } from 'react-use';
import { type z } from 'zod';
import { FormCheckboxField } from '../ui/FormCheckboxField';
import { FormInputField } from '../ui/FormInputField';
import { FormTextareaField } from '../ui/FormTextareaField';
import { Button } from '../ui/button';
import { Form, getSchemaChecks } from '../ui/form';
import { PersonaFormSchema } from './types';

export interface EditablePersonaDialogCoreProps {
  persona: CharacterDetailed;
  settings: UserSettings;
  dialogTrigger: 'new' | 'list-item';
  open: boolean;
  setOpen: (val: boolean) => void;
  handleCloseCallback: () => void;
}

export function EditablePersonaDialogCore({
  persona,
  settings,
  dialogTrigger,
  open,
  setOpen,
  handleCloseCallback,
}: EditablePersonaDialogCoreProps) {
  const isDefault = persona.external_id === settings?.default_persona_id;

  const thisUser = useAuth().user;
  const { data: publicUser } = useGetPublicUser(
    thisUser?.user?.username ?? '',
    false,
  );

  /** DIALOG HANDLERS */
  const handleClose = () => {
    form.reset();
    handleCloseCallback();
    setOpen(false);
  };

  const handleOpenChange = () => {
    if (open) {
      handleClose(); // reset form on close
    } else {
      setOpen(true);
    }
  };

  /** EDITOR FORM */
  const { isLoading, initialValues, handleDelete, handleSaveChanges } =
    usePersonaHook({
      persona,
      settings: settings ?? {},
      onSuccessCallback: handleClose,
      avatarFilenameFallback: publicUser?.avatar_file_name,
    });

  const form = useForm<z.infer<typeof PersonaFormSchema>>({
    resolver: zodResolver(PersonaFormSchema),
    mode: 'onChange',
    defaultValues: initialValues,
  });

  useEffect(() => {
    // Reset the form with new initialValues when they change after a persona update
    form.reset(initialValues);
  }, [form, initialValues]);

  const hasLocalChanges = useMemo(
    () => form.formState.isDirty && form.formState.isValid,
    [form.formState.isDirty, form.formState.isValid],
  );

  const onSubmit = async (values: z.infer<typeof PersonaFormSchema>) => {
    await handleSaveChanges(
      values,
      dialogTrigger === 'new' ? 'create' : 'update',
    );
  };

  const menuOptions = usePersonaMenuOptions({
    handleEdit: () => setOpen(true),
    handleToggleDefault: async () =>
      handleSaveChanges(
        { ...initialValues, enabled: !isDefault } as z.infer<
          typeof PersonaFormSchema
        >,
        'update',
      ),
    handleDelete,
    isDefault,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      analyticsProps={{ referrer: 'Persona', type: 'EditablePersonaDialog' }}
    >
      <DialogTrigger className="w-full flex justify-center">
        {dialogTrigger === 'list-item' ? (
          <PersonaListItem
            persona={persona}
            isDefault={isDefault}
            menuOptions={menuOptions}
            avatarSize={54}
          />
        ) : (
          <Button
            className="flex gap-1 bg-brand-bg"
            color="secondary"
            onPress={() => setOpen(true)}
          >
            <FaPlus />
            {t('Common.new')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent hideClose className="max-w-[440px] flex flex-col gap-5">
        <div className="w-full flex gap-4 items-center">
          <DialogClose>
            <X className="size-4" />
            <span className="sr-only">{t('Common.close')}</span>
          </DialogClose>
          <p>{t('Common.persona')}</p>
        </div>
        {dialogTrigger === 'new' && (
          <div className="w-full bg-transparency--4 rounded-spacing-xs p-3 flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              <div className="bg-transparency--4 rounded-full p-2">
                <BrainIcon width="1em" height="1em" />
              </div>
              <p className="truncate whitespace-normal break-words text-md">
                {t('Persona.characters-will-remember')}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-transparency--4 rounded-full p-2">
                <ProfileFilledIcon width="1em" height="1em" />
              </div>
              <p className="truncate whitespace-normal break-words text-md">
                {t('Persona.create-multiple-personas-to')}
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-auto flex flex-col justify-between w-96 gap-2"
          >
            <div className="w-full flex gap-4 items-center">
              <FormInputField
                name="name"
                checks={getSchemaChecks(PersonaFormSchema, 'name')}
              />
              <AvatarUploadField
                name="avatar_rel_path"
                username={persona.participant__name}
                size={40}
              />
            </div>
            <FormTextareaField
              name="definition"
              checks={getSchemaChecks(PersonaFormSchema, 'definition')}
              label={t('Persona.background')}
            />
            <FormCheckboxField
              name="enabled"
              label={t('Persona.make-default-for-new-chats')}
            />
            <div className="flex justify-end mt-4 gap-4 h-10 transition-opacity">
              {dialogTrigger !== 'new' && (
                <Button
                  type="button"
                  className="text-error"
                  variant="ghost"
                  disabled={isLoading}
                  onPress={() => {
                    handleDelete();
                    handleClose();
                  }}
                >
                  {t('Form.remove')}
                </Button>
              )}
              <Button
                type="submit"
                isDisabled={!hasLocalChanges || isLoading}
                isLoading={isLoading}
              >
                {t('Form.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
export function EditablePersonaDialog({
  persona,
  settings,
  dialogTrigger,
}: {
  persona: CharacterDetailed;
  settings: UserSettings;
  dialogTrigger: 'new' | 'list-item';
}) {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = searchParams?.get('id');
  const [hash] = useHash();
  const [open, setOpen] = useState(
    hash === '#personas' && searchId === persona.external_id,
  );

  const handleCloseCallback = () => {
    if (pathname && (hash || searchParams)) {
      void router.replace(pathname);
    }
  };

  return (
    <EditablePersonaDialogCore
      persona={persona}
      settings={settings}
      dialogTrigger={dialogTrigger}
      open={open}
      setOpen={setOpen}
      handleCloseCallback={handleCloseCallback}
    />
  );
}
