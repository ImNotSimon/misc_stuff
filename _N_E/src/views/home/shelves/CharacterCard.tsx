// TODO :: remove
/* eslint-disable i18next/no-literal-string */
import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { HideCharacterButton } from '@/components/Character/HideCharacterButton';
import { CreatorLink } from '@/components/Common/CreatorLink';
import { DynamicDropdownMenu } from '@/components/ui/DynamicDropdownMenu';
import { ChatIcon, ThumbsUpIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsTouchDevice } from '@/hooks/utils';
import { cn } from '@/lib/utils';
import { CDN_SIZE, formatLargeNumber } from '@/utils/appUtils';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BsThreeDots } from 'react-icons/bs';

export type CharacterCardProps = Pick<
  Character,
  | 'name'
  | 'user__username'
  | 'greeting'
  | 'title'
  | 'participant__num_interactions'
  | 'external_id'
  | 'upvotes'
> & {
  image: string | undefined;
};

export const CHARACTER_CARD_WIDTH = isMobile ? 300 : 312;

function CharacterCardOptions({ characterId }: { characterId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isTouch = useIsTouchDevice();

  return (
    <div
      className={cn(
        'opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 bottom-0 right-0 transition-all',
        { 'opacity-100': menuOpen || isTouch },
      )}
    >
      <DynamicDropdownMenu
        options={[
          {
            content: (
              <HideCharacterButton
                character_id={characterId}
                referrer="CharacterCard"
              />
            ),
            asChild: true,
            key: `hide-${characterId}`,
          },
        ]}
        setIsOpen={(open) => setMenuOpen(open)}
        isOpen={menuOpen}
        contentClassName="w-40"
        side="bottom"
      >
        <Button
          className="min-w-unit-6 w-unit-6 h-unit-6 "
          variant="ghost"
          size="sm"
          isIconOnly
          preventDefault
          onPress={() => setMenuOpen(true)}
          name={t('Home.more-options')}
          aria-label={t('Home.more-options')}
        >
          <BsThreeDots />
        </Button>
      </DynamicDropdownMenu>
    </div>
  );
}

export function CharacterCard(props: CharacterCardProps) {
  const {
    name,
    image,
    user__username: author,
    greeting,
    title,
    external_id: characterId,
    participant__num_interactions: numInteractions,
    upvotes,
  } = props;
  const { user } = useAuth();
  return (
    <div
      className={cn(
        'group/card h-[146px] bg-surface-elevation-1 hover:cursor-pointer hover:brightness-105 rounded-spacing-m p-4 flex flex-col gap-2 relative',
        `w-[${CHARACTER_CARD_WIDTH}px]`,
      )}
    >
      <div className="flex flex-row h-full space-x-3 w-full">
        <CharacterAvatar
          name={name}
          size={90}
          height={114}
          cdnOverride={CDN_SIZE.MEDIUM200}
          circle={false}
          src={image}
          loading="lazy"
        />
        <div className="overflow-auto h-full flex flex-col justify-between w-full">
          <div>
            <p className="mb-[2px] font-normal text-md leading-tight line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal">
              {name}
            </p>
            <CreatorLink author={author} className="mb-1" />
            <p className="text-foreground font-normal line-clamp-3 text-sm text-ellipsis overflow-hidden whitespace-normal break-anywhere">
              {title || greeting}
            </p>
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-1 items-center">
                <ChatIcon
                  width="14px"
                  height="14px"
                  className="text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  {formatLargeNumber(numInteractions)}
                </p>
              </div>
              {!!upvotes && (
                <div className="flex flex-row gap-1 items-center">
                  <ThumbsUpIcon
                    width="14px"
                    height="14px"
                    className="text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatLargeNumber(upvotes)}
                  </p>
                </div>
              )}
            </div>
            {!!user && <CharacterCardOptions characterId={characterId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
