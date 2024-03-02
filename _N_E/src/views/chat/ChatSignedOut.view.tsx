import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { CaiLogo } from '@/components/Common/CaiLogo';
import SignInButtons from '@/components/Common/SigninButtons';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { buildMockCandidate, buildMockTurn } from '@/utils/appUtils';
import { ChatDetails } from '@/views/chat/ChatDetails';
import { ChatInputComponentBlank } from '@/views/chat/ChatInput';
import { ChatCandidateComponent } from '@/views/chat/ChatMessage/ChatCandidateComponent';
import { ChatSystemMessage } from '@/views/chat/ChatMessage/SystemMessages/ChatSystemMessage';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { ClientSystemMessageEnum } from '@character-tech/client-common/src/types/types';
import { t } from 'i18next';

export function ChatViewSignedOut({ characterId }: { characterId: string }) {
  const { character } = useCharacterInfo(characterId);

  return (
    <>
      <title>
        {character
          ? t('Chat.title', { name: character?.participant__name })
          : t('Home.title')}
      </title>
      <div className="w-full flex h-full overflow-x-hidden pt-12">
        <div className="flex flex-col h-full w-full items-center">
          <div className="flex flex-col gap-6 relative h-dvh w-full justify-between  max-w-3xl">
            <div>
              <ChatSystemMessage
                turn={buildMockTurn({
                  author: {
                    avatar_url: character?.avatar_file_name,
                    name: character?.name ?? '',
                    is_human: false,
                    author_id: '',
                  },
                  clientSystemMessage: {
                    message: character?.title ?? '',
                    messageType: ClientSystemMessageEnum.creator_attribution,
                    payload: character?.user__username,
                  },
                })}
              />
              <ChatCandidateComponent
                candidate={buildMockCandidate({
                  raw_content: character?.greeting,
                })}
                turn={buildMockTurn({
                  author: {
                    avatar_url: character?.avatar_file_name,
                    name: character?.name ?? '',
                    is_human: false,
                    author_id: '',
                  },
                })}
              />
            </div>
            <ChatInputComponentBlank />
            <div className="fixed inset-0 z-50 bg-scrim w-full h-full" />
            <Dialog defaultOpen modal={false}>
              <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                hideClose
                className="flex-auto flex bg-surface-elevation-1 flex-col justify-between items-center"
              >
                <CaiLogo />
                {!!character && (
                  <CharacterAvatar
                    name={character?.name}
                    size={92}
                    src={character?.avatar_file_name}
                  />
                )}
                {t('Chat.sign-up-to-chat-with-character-name', {
                  character: character?.name,
                })}
                <SignInButtons />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <ChatDetails characterId={characterId} />
      </div>
    </>
  );
}
