import { HumanAvatar } from '@/components/Profile/HumanAvatar';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner/spinner';
import { cn } from '@/lib/utils';
import { api } from '@/utils/api';
import { fileToDataUrl } from '@/utils/appUtils';
import { t } from 'i18next';
import { useRef, useState } from 'react';
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
} from 'react-hook-form';
import { FiEdit3 } from 'react-icons/fi';

export function AvatarUploadField({
  name,
  username,
  size,
}: {
  name: string;
  username: string;
  size?: number;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <AvatarUpload field={field} username={username} size={size} />
      )}
    />
  );
}

function AvatarUpload({
  field,
  username,
  size,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  username: string;
  size?: number;
}) {
  const avatarSize = size ?? 86;
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const uploadAvatar = api.user.uploadAvatar.useMutation();
  const form = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileSelected = async ({ target }: { target: HTMLInputElement }) => {
    const image = target.files?.[0];
    if (!image) return;
    setIsUploading(true);
    setErrorMessage('');
    try {
      const imageDataUrl = await fileToDataUrl(image);
      const filename = await uploadAvatar.mutateAsync({ imageDataUrl });
      form.setValue(field.name, filename, { shouldDirty: true });
      // bug workaround to cause form to go dirty
      await form.trigger(field.name);
      // Should allow re-trying the same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setErrorMessage(t('Error.imageUploadFailed'));
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormItem
      style={{
        width: avatarSize,
        height: avatarSize,
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        className={cn(
          'relative w-full h-full flex justify-center items-center',
          {
            'cursor-pointer': !field.disabled,
          },
        )}
      >
        {isUploading ? (
          <Spinner />
        ) : (
          <>
            <HumanAvatar src={field.value} name={username} size={avatarSize} />
            <div className="absolute -bottom-1 p-1.5 rounded-full -right-1 bg-surface-elevation-2">
              <FiEdit3 size={Math.floor(avatarSize * 0.25)} />
            </div>
          </>
        )}
        {!field.disabled && (
          <input
            type="file"
            accept="image/*"
            onChange={fileSelected}
            ref={fileInputRef}
            className="hidden"
          />
        )}
      </label>
      {!!errorMessage && (
        <div className="text-sm text-error">{errorMessage}</div>
      )}
      <FormControl>
        <div className="hidden">
          <Input type="text" {...field} />
        </div>
      </FormControl>
    </FormItem>
  );
}
