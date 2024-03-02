'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { AvatarUploadType } from '@/utils/constants';
import { useUpdateUserProfile } from '@character-tech/client-common/src/hooks/queries/user';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormInputField } from '../ui/FormInputField';
import { FormTextareaField } from '../ui/FormTextareaField';
import { Form, getSchemaChecks } from '../ui/form';
import { AppToast } from '../ui/use-toast';
import { AvatarUploadField } from './AvatarUpload';

const formSchema = z.object({
  username: z.string().min(2).max(20),
  name: z.string().min(2).max(50),
  bio: z.string().max(500),
  avatar_file_name: z.string(),
  avatar_type: z.string(),
});

export function ProfileForm() {
  const { user, setUser } = useAuth();
  const updateUserProfile = useUpdateUserProfile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      username: user?.user?.username || '',
      name: user?.name || '',
      bio: user?.bio || '',
      avatar_file_name: user?.user?.account?.avatar_file_name || '',
      avatar_type: user?.user?.account?.avatar_type,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const avatarInfo = form.getFieldState('avatar_file_name').isDirty
        ? {
            avatar_rel_path: values.avatar_file_name,
            avatar_type: AvatarUploadType.UPLOADED,
          }
        : {};
      await updateUserProfile.mutateAsync({
        ...values,
        ...avatarInfo,
      });
      setUser((currentUser: Participant) => ({
        ...currentUser,
        user: {
          ...currentUser.user,
          username: values.username.trim(),
          account: {
            ...currentUser.user?.account,
            avatar_file_name: values.avatar_file_name,
            avatar_type: values.avatar_type,
          },
        },
        name: values.name.trim(),
        bio: values.bio.trim(),
      }));
      form.reset(values);
      AppToast(t('User.profile-updated'));
    } catch (error) {
      AppToast(t('User.profile-update-failed'), undefined, 'destructive');
      throw error;
    }
  };

  const isSaveVisible =
    form.formState.isDirty &&
    !form.formState.isSubmitting &&
    form.formState.isValid;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full h-full justify-between gap-4"
      >
        <div className="flex flex-col gap-3 w-full">
          <AvatarUploadField
            name="avatar_file_name"
            username={user?.user?.username ?? ''}
          />
          <div className="flex flex-col gap-3">
            <FormInputField
              name="username"
              checks={getSchemaChecks(formSchema, 'username')}
            />
            <FormInputField
              name="name"
              checks={getSchemaChecks(formSchema, 'name')}
            />
            <FormTextareaField
              name="bio"
              checks={getSchemaChecks(formSchema, 'bio')}
            />
          </div>
        </div>
        <div
          className={cn(
            'flex justify-end gap-4 pointer-events-none opacity-0 transition-opacity',
            {
              'opacity-100': isSaveVisible,
              'pointer-events-auto': isSaveVisible,
            },
          )}
        >
          <Button type="button" color="secondary" onPress={() => form.reset()}>
            {t('Form.cancel')}
          </Button>
          <Button type="submit">{t('Form.save')}</Button>
        </div>
      </form>
    </Form>
  );
}
