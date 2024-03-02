import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useHideCharacterChat } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useCallback, type ForwardedRef } from 'react';
import { Button } from '../ui/button';

export const HideCharacterChatButton = React.forwardRef<
  HTMLButtonElement,
  { character_id: string; referrer: string; handlePressCallback: () => void }
>(
  (
    { character_id, referrer, handlePressCallback },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { mutate: hideCharacterChat } = useHideCharacterChat();

    const pathname = usePathname();
    const router = useRouter();

    const handlePress = useCallback(() => {
      hideCharacterChat(
        { externalId: character_id },
        {
          onSuccess: async () => {
            handlePressCallback();
            if (AppPaths.chat(character_id) === pathname) {
              await router.push('/');
            }
          },
        },
      );
    }, [
      hideCharacterChat,
      router,
      pathname,
      character_id,
      handlePressCallback,
    ]);

    return (
      <Button
        ref={ref}
        variant="ghost"
        className="rounded-spacing-xs flex justify-start"
        onPress={handlePress}
        analyticsProps={{
          eventName: AnalyticsEvents.UX.ElementClicked,
          properties: {
            characterId: character_id,
            type: 'HideCharacterChatButton',
            referrer,
          },
        }}
        preventDefault
      >
        {t('Guide.remove-from-recents')}
      </Button>
    );
  },
);
HideCharacterChatButton.displayName = 'HideCharacterChatButton';
