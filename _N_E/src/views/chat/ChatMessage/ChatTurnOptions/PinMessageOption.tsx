import { logAnalyticsEvent } from '@/analytics/analytics';
import { PinFilledIcon, PinIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/context/CharacterContext';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { type PublicSetTurnPin } from '@character-tech/client-common/src/chatManager/chatManagerTypes';
import { type TurnKey } from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { t } from 'i18next';
import { useCallback } from 'react';

export function PinMessageOption({
  turnKey,
  isCurPinned,
}: {
  turnKey: TurnKey;
  isCurPinned: boolean;
}) {
  const { publish } = useChatContext();
  const { character } = useCharacter();

  const handlePinUpdate = useCallback(() => {
    if (!character) {
      return;
    }
    const payload = {
      type: 'set_turn_pin',
      turnKey,
      isPinned: !isCurPinned,
    } as PublicSetTurnPin;

    logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, payload);
    publish(character.external_id, payload);
  }, [character, publish, turnKey, isCurPinned]);

  return (
    <Button
      key="pin-button"
      variant="ghost"
      className="justify-between w-full rounded-spacing-s"
      onPress={handlePinUpdate}
      endContent={
        isCurPinned ? (
          <PinIcon height="1.25em" />
        ) : (
          <PinFilledIcon height="1.25em" />
        )
      }
    >
      {isCurPinned ? t('Chat.unpin-message') : t('Chat.pin-message')}
    </Button>
  );
}
