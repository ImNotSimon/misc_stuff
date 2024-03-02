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
import { HistoryIcon } from '@/components/ui/Icon';
import { rewindItemIndexSignal } from '@/lib/state/signals';
import { DialogClose } from '@radix-ui/react-dialog';
import { t } from 'i18next';
import { useState } from 'react';

export function ConfirmRewindDialog({ listIndex }: { listIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      analyticsProps={{ referrer: 'ChatOptions', type: 'RewindMessagesDialog' }}
    >
      <DialogTrigger className="w-full">
        <Button
          variant="ghost"
          className="justify-between w-full rounded-spacing-s"
          onPress={() => setIsOpen(true)}
        >
          {t('Chat.rewind-conversation')} <HistoryIcon height="1.25em" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Chat.rewind-conversation')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t(
            'Chat.are-you-sure-you-want-to-rewind-the-conversation-to-this-point',
          )}
        </DialogDescription>
        <DialogFooter>
          <DialogClose>
            <Button onPress={() => setIsOpen(false)} variant="outline">
              {t('Common.cancel')}
            </Button>
          </DialogClose>
          <DialogClose>
            <Button
              onPress={() => {
                rewindItemIndexSignal.value = listIndex;
                setIsOpen(false);
              }}
              color="danger"
            >
              {t('Chat.rewind')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
