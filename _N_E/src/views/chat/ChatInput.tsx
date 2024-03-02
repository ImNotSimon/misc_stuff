import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { SendFilledIcon, StopIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCharacter } from '@/context/CharacterContext';
import { useVoiceContext } from '@/context/VoiceContext';
import {
  useChatEventsSubscription,
  useGetExampleChatInput,
} from '@/hooks/chatHooks';
import { type ChatStreamingStatusEnum } from '@/types/types';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { discoveryQueries } from '@character-tech/client-common/src/hooks/queries/baseQueries';
import { useQueryClient } from '@character-tech/client-common/src/hooks/queries/setup';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

export function ChatInputComponent({
  streamingStatus,
}: {
  streamingStatus: ChatStreamingStatusEnum;
}) {
  const { unrecoverableErrorOccurred } = useChatEventsSubscription();

  const queryClient = useQueryClient();
  const { characterId, character } = useCharacter();
  const [hasResurrectedChat, setHasResurrectedChat] = useState(false);
  const { publish } = useChatContext();
  const {
    isVoiceEnabled,
    isCharacterSpeaking,
    isCharacterMaybeSpeaking,
    expectCharacterSpeech,
    abortCharacterSpeech,
  } = useVoiceContext();

  const [inputText, setInputText] = useState('');
  const onSend = () => {
    if (!characterId) {
      return;
    }
    const shouldAbort = streamingStatus !== 'none';
    if (shouldAbort) {
      publish(characterId, { type: 'abort' });
    }
    if (isCharacterSpeaking) {
      abortCharacterSpeech();
      return;
    }
    if (shouldAbort) {
      return;
    }
    publish(characterId, {
      type: 'create_and_generate',
      message: inputText,
      primaryCandidateId: undefined,
      ttsEnabled: isVoiceEnabled,
    });
    // only create the text on a create_and_generate
    setInputText('');
    expectCharacterSpeech();

    if (!hasResurrectedChat) {
      setHasResurrectedChat(true);
      void queryClient.invalidateQueries(discoveryQueries.recent.keys(true));
    }
  };

  const { resolveExampleChatPrompt } = useGetExampleChatInput({ setInputText });

  useEffect(() => {
    resolveExampleChatPrompt();
  }, [resolveExampleChatPrompt]);

  const showStopButton = isVoiceEnabled
    ? isCharacterSpeaking
    : streamingStatus === 'streaming';

  const disableSubmitButton =
    streamingStatus === 'waiting' ||
    (isCharacterMaybeSpeaking && !isCharacterSpeaking);

  return (
    <ChatInputComponentImpl
      onSend={onSend}
      showStopButton={showStopButton}
      disableSubmitButton={disableSubmitButton}
      placeholder={
        character
          ? t('Chat.message-char', { char: character.name })
          : t('Chat.send-a-message')
      }
      inputText={inputText}
      setInputText={setInputText}
      unrecoverableErrorOccurred={unrecoverableErrorOccurred}
    />
  );
}

export const ChatInputComponentBlank = () => (
  <ChatInputComponentImpl
    showStopButton={false}
    disableSubmitButton={false}
    onSend={() => {}}
    placeholder={t('Chat.send-a-message')}
    inputText=""
    setInputText={() => {}}
    unrecoverableErrorOccurred={false}
  />
);

export const ChatInputComponentImpl = ({
  showStopButton,
  disableSubmitButton,
  onSend,
  placeholder,
  inputText,
  setInputText,
  unrecoverableErrorOccurred,
}: {
  showStopButton: boolean;
  disableSubmitButton: boolean;
  onSend: () => void;
  placeholder: string;
  inputText: string;
  setInputText: (text: string) => void;
  unrecoverableErrorOccurred: boolean;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null); // Fix: Specify the element type as HTMLTextAreaElement
  if (unrecoverableErrorOccurred) {
    return (
      <div className="m-4 flex flex-col items-center">
        <p className="bold">{t('Error.something-went-wrong')}</p>
        <p>{t('Error.please-refresh-or-try-again-later')}</p>
      </div>
    );
  }
  return (
    <>
      <div className="m-4 mb-10 flex rounded-sm placeholder:text-placeholder p-1 border-solid border-[1px] border-border-outline items-end bg-surface-elevation-1">
        <Textarea
          autoFocus={!isMobile}
          ref={inputRef}
          className="rounded-r-none text-lg w-full border-none rounded-2xl bg-surface-elevation-1 ml-2"
          inputMode="text"
          placeholder={placeholder}
          onChange={(evt) => setInputText(evt.target.value)}
          value={inputText}
          onKeyDown={(evt) => {
            // if we are not on mobile, and we are not holding shift, and we press enter, send the message
            if (!isMobile && evt.code === 'Enter' && evt.shiftKey === false) {
              evt.preventDefault();
              onSend();
            }
          }}
          chatMode
        />
        <Button
          isDisabled={disableSubmitButton}
          disableAnimation
          disableRipple
          onPressStart={() => {
            onSend();
            inputRef.current?.focus();
          }}
          isIconOnly
        >
          {!showStopButton && (
            <AnimationFadeInAndOut>
              <SendFilledIcon height="1.25em" color="var(--icon-inverted)" />
            </AnimationFadeInAndOut>
          )}
          {!!showStopButton && (
            <AnimationFadeInAndOut>
              <StopIcon height="1.25em" color="var(--icon-inverted)" />
            </AnimationFadeInAndOut>
          )}
        </Button>
      </div>
      <p className="absolute bottom-3 self-center text-muted-foreground text-[0.70rem] select-none">
        {t('Common.remember-everything-characters-say-are-made-up')}
      </p>
    </>
  );
};
