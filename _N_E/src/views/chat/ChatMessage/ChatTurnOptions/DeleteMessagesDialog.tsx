import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrashIcon } from '@/components/ui/Icon';
import { deletedItemIndexSignal } from '@/lib/state/signals';
import { DialogClose } from '@radix-ui/react-dialog';
import { t } from 'i18next';
import { useState } from 'react';

export function ConfirmDeleteDialog({ listIndex }: { listIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      analyticsProps={{ referrer: 'ChatOptions', type: 'DeleteMessagesDialog' }}
    >
      <DialogTrigger className="w-full">
        <Button
          variant="ghost"
          className="justify-between w-full rounded-spacing-s"
          onPress={() => setIsOpen(true)}
        >
          {t('Chat.delete-messages')} <TrashIcon height="1.25em" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Chat.delete-messages')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t('Chat.are-you-sure-you-want-to-delete-this-message')}
        </DialogDescription>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline" onPress={() => setIsOpen(false)}>
              {t('Common.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onPress={() => {
                deletedItemIndexSignal.value = listIndex;
              }}
              color="danger"
            >
              {t('Chat.delete-messages-action')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
