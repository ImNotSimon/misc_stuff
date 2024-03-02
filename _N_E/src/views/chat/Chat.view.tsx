'use client';

import { Spinner } from '@/components/Common/Loader';
import { AppToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { CharacterContextProviderFromUrl } from '@/context/CharacterContext';
import { VoiceContextProvider } from '@/context/VoiceContext';
import { getAxiosInstance } from '@/lib/axios';
import { type ChatStreamingStatusEnum } from '@/types/types';
import {
  createChatAttributionMessage,
  getPrimaryCandidate,
  isCandidatePending,
} from '@/utils/chatUtils';
import { ChatVoiceSelectionView } from '@/views/chat/ChatVoice/ChatVoiceSelection';
import {
  ChatContextProvider,
  useChatContext,
} from '@character-tech/client-common/src/chatManager';
import {
  ChatEventEnum,
  ChatServiceType,
  type ChatEventWebsocketErrorPayload,
} from '@character-tech/client-common/src/chatManager/chatManagerTypes';
import { NeoErrorCodes } from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { discoveryQueries } from '@character-tech/client-common/src/hooks/queries/baseQueries';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { type ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatCharacterInfo } from './ChatCharacterInfo';
import { useChatDebugHooks } from './ChatDebugHooks';
import { ChatDetails } from './ChatDetails';
import { useChatEffectHooks } from './ChatHooks';
import { ChatInputComponent } from './ChatInput';
import { ChatMenu } from './ChatMenu';
import { ChatMessages } from './ChatMessages';

export interface ChatViewProps {
  characterId: string;
  historyOverride: string | null;
}

export function ChatView(props: ChatViewProps) {
  const { user, token } = useAuth();

  return (
    <ChatContextProvider
      getAxiosInstance={getAxiosInstance}
      neoEnabled
      originId="web-next"
      userId={user?.user?.id}
      useCentrifuge={false}
      errorLogger={(message: string) => {
        console.error(message);
      }}
    >
      <CharacterContextProviderFromUrl>
        {/* eslint-disable-next-line react/destructuring-assignment */}
        <ChatViewAuthed {...props} token={token} key={props.characterId} />
      </CharacterContextProviderFromUrl>
    </ChatContextProvider>
  );
}

function ChatViewAuthed({
  characterId,
  historyOverride,
  token,
}: ChatViewProps & { token: string }) {
  useChatDebugHooks();
  // TODO: prefetch potentially
  const { character } = useCharacterInfo(characterId ?? '');
  const { subscribe, subscribeChatEvents, getChatMessages } = useChatContext();
  const [chatId, setChatId] = useState<string | null>(null);
  const [primaryCandidateId, setPrimaryCandidateId] = useState<string | null>(
    null,
  );
  const [chatTurns, setChatTurns] = useState<ViewChatMessage[]>();
  const [introMessage, setIntroMessage] = useState<ViewChatMessage>();
  const [streamingStatus, setStreamingStatus] =
    useState<ChatStreamingStatusEnum>('waiting');
  const queryClient = useQueryClient();

  // keeps track of selected candidates when users swipe through the carousel
  const primaryCandidateMap = useRef<Record<string, number>>({});

  const processedTurns = useMemo(
    () =>
      // if we got turns, and we have less than 20 messages, insert the intro message
      introMessage && chatTurns && chatTurns.length < 20
        ? [...chatTurns, introMessage]
        : chatTurns,
    [chatTurns, introMessage],
  );

  // helper to acquire more chat messages for pagination
  const getMoreChatMessages = useCallback(
    () => getChatMessages(characterId),
    [characterId, getChatMessages],
  );

  useChatEffectHooks(processedTurns, characterId);

  useEffect(() => {
    if (!characterId) {
      return;
    }
    const { unsubscribe } = subscribe(
      characterId,
      (turns, _primaryCandidateMap) => {
        const primaryCandidate = getPrimaryCandidate(
          turns,
          _primaryCandidateMap,
        );

        if (primaryCandidate != null) {
          setPrimaryCandidateId(primaryCandidate.candidate_id);
          if (
            turns.length > 0 &&
            isCandidatePending(turns[0], primaryCandidate)
          ) {
            setStreamingStatus('waiting');
          } else {
            setStreamingStatus(
              primaryCandidate.is_final ? 'none' : 'streaming',
            );
          }
        } else {
          setPrimaryCandidateId(null);
          // Fallback to none.
          setStreamingStatus('none');
        }
        if (turns.length > 0) {
          const lastTurn = turns[0];
          setChatId(lastTurn.turn_key.chat_id);
        } else {
          setChatId(null);
        }
        setChatTurns(turns);
        primaryCandidateMap.current = _primaryCandidateMap;
      },
      ChatServiceType.Neo, // only neo is supported
      historyOverride ?? undefined,
      undefined,
      false,
    );
    return unsubscribe;
  }, [characterId, subscribe, historyOverride]);

  useEffect(() => {
    void queryClient.invalidateQueries([discoveryQueries.recent.keys(true)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  useEffect(() => {
    if (character) {
      setIntroMessage(createChatAttributionMessage(character));
    }
  }, [character]);

  useEffect(() => {
    const unsubscribeError = subscribeChatEvents(
      ChatEventEnum.websocket_error,
      (_eventType: ChatEventEnum, payload: ChatEventWebsocketErrorPayload) => {
        if (
          Number(payload.error_code) === NeoErrorCodes.TooManyPins.errorCode &&
          Number(payload.sub_code) === NeoErrorCodes.TooManyPins.subCode
        ) {
          AppToast(
            t('Chat.max-pin-limit-reached').toString(),
            undefined,
            'destructive',
          );
        }
      },
    );

    return () => {
      unsubscribeError();
    };
  }, [subscribeChatEvents]);

  // Some characters are greetingless... annoyingly
  const initialMessageCount = 1 - (character?.greeting ? 0 : 1);

  const chatReady =
    processedTurns && processedTurns.length >= initialMessageCount && character;

  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);

  return (
    <VoiceContextProvider
      authToken={token}
      characterId={characterId}
      chatId={chatId}
      candidateId={primaryCandidateId}
      onRequestVoice={() => setIsVoiceSelectionOpen(true)}
    >
      <Head>
        <title>{t('Common.c-ai-chat-title', { name: character?.name })}</title>
      </Head>
      <ChatVoiceSelectionView
        isOpen={isVoiceSelectionOpen}
        onOpenChange={setIsVoiceSelectionOpen}
      />
      <title>
        {character
          ? t('Chat.title', { name: character?.participant__name })
          : t('Home.title')}
      </title>
      <div className="size-full flex overflow-x-hidden">
        <div className="flex flex-col size-full items-center flex-1 ">
          <div className="w-full justify-between lg:hidden p-6 pl-16 md:px-12 h-20 flex">
            <ChatCharacterInfo characterId={characterId} />
            <ChatMenu characterId={characterId} />
          </div>
          {chatReady ? (
            <>
              <div className="flex size-full flex-1 flex-col justify-center align-middle relative">
                {!!processedTurns && (
                  <ChatMessages
                    getChatMessages={getMoreChatMessages}
                    key={characterId}
                    chatTurns={processedTurns}
                    primaryCandidateMap={primaryCandidateMap.current}
                  />
                )}
              </div>
              <div className="flex w-full flex-col max-w-2xl">
                <ChatInputComponent streamingStatus={streamingStatus} />
              </div>
            </>
          ) : (
            <Spinner />
          )}
        </div>
        <ChatDetails characterId={characterId} />
      </div>
    </VoiceContextProvider>
  );
}
