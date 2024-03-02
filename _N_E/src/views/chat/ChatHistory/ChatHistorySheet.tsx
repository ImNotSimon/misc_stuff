import { logAnalyticsEvent } from '@/analytics/analytics';
import {
  ChevronRightIcon,
  HistoryIcon,
  NewChatIcon,
} from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useCharacter } from '@/context/CharacterContext';
import { useCharacterChatHistory } from '@/hooks/chat';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatHistoryItem } from './ChatHistoryItem';

export function ChatHistorySheet() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { refresh } = useChatContext();
  const { t } = useTranslation();
  const { characterId } = useCharacter();
  const [isOpen, setIsOpen] = useState(false);

  const { histories, isLoading } = useCharacterChatHistory(
    isOpen ? characterId : null,
  );

  const startNewChat = () => {
    if (searchParams) {
      void router.push(AppPaths.chat(characterId));
    }
    if (characterId) {
      refresh(characterId, true, true);
    }
    logAnalyticsEvent(AnalyticsEvents.UX.CharacterSelected, {
      referrer: 'ChatHistory',
      characterId,
      newHistory: true,
      action: 'save_and_start_new_chat',
    });
    setIsOpen(false);
  };

  const hasHistories = !!characterId && !!histories;
  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen} modal={false}>
      <SheetTrigger
        className="flex justify-between items-center w-full"
        asChild
      >
        <Button
          variant="ghost"
          className="w-full flex justify-between rounded-spacing-xs"
          onPress={() => {
            setIsOpen(true);
            logAnalyticsEvent(AnalyticsEvents.UX.PageViewed, {
              page: 'ChatHistory',
              referrer: 'ChatHistorySheet',
            });
          }}
        >
          <div className="flex items-center w-fit gap-3">
            <HistoryIcon className="text-secondary-foreground size-5" />
            {t('Chat.view-chat-history')}
          </div>
          <div className="flex gap-1 items-center">
            <div>
              <ChevronRightIcon className="text-muted-foreground size-3" />
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-screen flex-col">
        <SheetClose>
          <SheetHeader className="flex flex-row items-center gap-6">
            <ChevronRightIcon className="text-muted-foreground size-4" />
            {t('Chat.chat-history')}
            <Button
              isIconOnly
              variant="ghost"
              onPress={startNewChat}
              className="right-4 absolute opacity-50"
            >
              <NewChatIcon height="1.25em" />
            </Button>
          </SheetHeader>
        </SheetClose>
        <div className=" overflow-y-scroll grow-1 flex flex-col gap-4 -mr-6 pr-2">
          {!!hasHistories &&
            histories.map((history) => (
              <SheetClose key={history.chat_id}>
                <ChatHistoryItem characterId={characterId} history={history} />
              </SheetClose>
            ))}
          {isLoading ||
            (!hasHistories && (
              <>
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
              </>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
