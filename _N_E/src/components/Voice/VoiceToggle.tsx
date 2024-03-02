import { useVoiceContext } from '@/context/VoiceContext';
import { useGetVoice } from '@character-tech/client-common/src/hooks/queries/voices';
import { t } from 'i18next';
import { ChevronRightIcon, VoiceIcon, VoiceOffIcon } from '../ui/Icon';
import { Button } from '../ui/button';

export function VoiceToggle({ isCompact }: { isCompact?: boolean }) {
  const {
    isVoiceEnabled,
    isTtsEnabledForCurrentUser,
    enableVoice,
    disableVoice,
    onRequestVoice,
    getCharacterVoiceId,
  } = useVoiceContext();

  const voiceId = getCharacterVoiceId();
  const { voice: selectedVoice } = useGetVoice(voiceId);

  if (!isTtsEnabledForCurrentUser) {
    return null;
  }

  if (isCompact) {
    return isVoiceEnabled ? (
      <Button onPress={disableVoice} variant="outline" isIconOnly>
        <VoiceOffIcon className="size-4" />
      </Button>
    ) : (
      <Button onPress={enableVoice} variant="outline" isIconOnly>
        <VoiceIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full flex justify-between gap-2"
      onPress={onRequestVoice}
    >
      <div className="flex items-center w-fit gap-4">
        <VoiceIcon className="size-4" /> {t('Chat.enable-voice')}
      </div>
      <div className="flex gap-1 items-center text-muted-foreground">
        <div>{selectedVoice?.name}</div>
        <div>
          <ChevronRightIcon className="size-3" />
        </div>
      </div>
    </Button>
  );
}
