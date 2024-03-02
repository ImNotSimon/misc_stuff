import { isUserPlusMember } from '@/utils/userUtils';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { X } from 'lucide-react';
import { useState } from 'react';
import { WarningFilledIcon } from '../ui/Icon';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { DeleteData } from './AccountOptionsButtons';

export function DeleteAccountDialog({
  user,
  handleDeleteAccount,
  isLoadingDeleteAccount,
}: {
  user: Participant;
  handleDeleteAccount: () => void;
  isLoadingDeleteAccount: boolean;
}) {
  const [open, setOpen] = useState(false);

  const isPlus = isUserPlusMember(user);

  const [inputValue, setInputValue] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer: 'Profile', type: 'DeleteAccountDialog' }}
    >
      <DialogTrigger className="w-full">
        <DeleteData onPress={() => setOpen(!open)} />
      </DialogTrigger>
      <DialogContent className="w-96 h-fit p-0 flex flex-col" hideClose>
        <DialogHeader className="h-fit w-full flex flex-row justify-between items-center px-5 py-4 border-b-1 border-b-accent">
          <div className="flex flex-row gap-4 text-md items-center">
            <DialogClose>
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">{t('Common.close')}</span>
            </DialogClose>
            {t('Common.delete-account')}
          </div>
          <WarningFilledIcon height="24px" className="text-error" />
        </DialogHeader>
        <div className="h-full flex flex-col justify-center py-2 px-1 gap-4">
          <div className="w-full flex flex-col gap-3 justify-start items-start px-4">
            {!!isPlus && (
              <div className="text-sm bg-accent p-2 opacity-500 text-error rounded-spacing-xs">
                {t('DeleteAccount.remove-your-subscription')}
              </div>
            )}
            <p>{t('DeleteAccount.this-action-cannot-be-undone')}</p>
            <p className="text-sm text-muted-foreground">
              {t('DeleteAccount.things-will-be-lost')}
            </p>
            <Input
              className="bg-surface-elevation-2 p-4"
              value={inputValue}
              onChange={(evt) => setInputValue(evt.target.value)}
              placeholder={t('DeleteAccount.enter-username-to-confirm')}
            />
          </div>
          <div className="w-full flex justify-end gap-2 my-1 px-4 py-2">
            <Button variant="ghost" onPress={() => setOpen(false)}>
              {t('Common.cancel')}
            </Button>
            <Button
              variant="primary"
              color="danger"
              isDisabled={inputValue !== user.user?.username}
              onPress={handleDeleteAccount}
              isLoading={isLoadingDeleteAccount}
            >
              {t('Common.delete-account')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
