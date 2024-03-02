'use client';

import { logAnalyticsEvent } from '@/analytics/analytics';
import { CharacterDropdownOptions } from '@/components/Character/CharacterDropdownOptions';
import { CharacterVote } from '@/components/Common/CharacterVote';
import { Spinner } from '@/components/Common/Loader';
import { EnableDebugOptions } from '@/components/Debug/CandidateDebugInfo';
import { ReportCharacterDialog } from '@/components/Moderation/ReportCharacterDialog';
import { PersonaOverrideDialog } from '@/components/Persona/PersonaOverrideDialog';
import { VoiceToggle } from '@/components/Voice/VoiceToggle';
import { NewChatIcon, ShareIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { AppPaths } from '@/utils/appUtils';
import { shareLink } from '@/utils/browserUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { ChatCharacterInfoDetailed } from './ChatCharacterInfo';
import { ChatHistorySheet } from './ChatHistory/ChatHistorySheet';

export function ChatDetails({ characterId }: { characterId: string }) {
  return (
    <div className="w-[325px] h-full border-l border-l-muted flex-col p-4 gap-3 hidden lg:flex">
      <ChatDetailsContent characterId={characterId} />
    </div>
  );
}

interface ChatDetailsContentProps {
  characterId: string;
  closeMenu?: () => void;
}

export function ChatDetailsContent({
  characterId,
  closeMenu,
}: ChatDetailsContentProps) {
  const { refresh } = useChatContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuth();
  const { character } = useCharacterInfo(characterId ?? '');

  if (!character) {
    // TODO: ryderd make a nicer loading placeholder
    return <Spinner />;
  }

  const startNewChat = () => {
    if (searchParams) {
      void router.push(AppPaths.chat(characterId));
    }
    if (characterId) {
      refresh(characterId, true, true);
      if (closeMenu) {
        closeMenu();
      }
    }
    logAnalyticsEvent(AnalyticsEvents.UX.CharacterSelected, {
      referrer: 'ChatDetails',
      characterId,
      newHistory: true,
      action: 'save_and_start_new_chat',
    });
  };

  return (
    <>
      <ChatCharacterInfoDetailed characterId={characterId} />
      <div className="flex justify-between">
        <div className="flex flex-row gap-1">
          <Button
            isIconOnly
            variant="outline"
            onPress={() =>
              shareLink(AppPaths.chat(characterId ?? ''), 'Character')
            }
          >
            <ShareIcon className="size-4 text-muted-foreground" />
          </Button>
          <CharacterVote characterId={characterId} />
        </div>
        <div className="flex gap-2">
          <ReportCharacterDialog character={character} />
          <CharacterDropdownOptions
            thisIsMyCharacter={
              character.user__username === user?.user?.username
            }
            characterId={character.external_id}
            alwaysShow
            contentClassName="w-40"
          />
        </div>
      </div>
      {!!character.title && (
        <p className="text-muted-foreground text-sm">{character.title}</p>
      )}
      <Separator className="" />
      <Button
        color="secondary"
        className="flex justify-between w-fit gap-4 bg-brand-bg"
        onPress={startNewChat}
      >
        <NewChatIcon className="text-muted-foreground size-4" />
        {t('Chat.start-new-chat')}
      </Button>
      <ChatHistorySheet />
      <VoiceToggle />
      <PersonaOverrideDialog characterId={characterId} />
      <EnableDebugOptions />
    </>
  );
}
