import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useHideCharacter } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useCallback, type ForwardedRef } from 'react';
import { Button } from '../ui/button';

export const HideCharacterButton = React.forwardRef<
  HTMLButtonElement,
  { character_id: string; referrer: string }
>(({ character_id, referrer }, ref: ForwardedRef<HTMLButtonElement>) => {
  const hideCharacter = useHideCharacter(character_id);
  const pathname = usePathname();
  const router = useRouter();

  const handlePress = useCallback(async () => {
    await hideCharacter();
    if (AppPaths.chat(character_id) === pathname) {
      await router.push('/');
    }
  }, [hideCharacter, router, pathname, character_id]);

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
          type: 'HideCharacterButton',
          referrer,
        },
      }}
      preventDefault
    >
      {t('Common.hide-character')}
    </Button>
  );
});
HideCharacterButton.displayName = 'HideCharacterButton';
