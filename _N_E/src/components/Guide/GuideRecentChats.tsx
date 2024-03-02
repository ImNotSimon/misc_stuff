'use client';

import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { CharacterListItemCompactSkeleton } from '@/components/Character/CharacterListItemCompact';
import { ErrorView } from '@/components/Common/ErrorView';
import { categorizeCharacters } from '@/components/Guide/GuideUtils';
import { DynamicDropdownMenu } from '@/components/ui/DynamicDropdownMenu';
import { Listbox, ListboxItem, ListboxSection } from '@/components/ui/listbox';
import { useCharacterEditorContext } from '@/context/CharacterEditorContext';
import { useIsTouchDevice } from '@/hooks/utils';
import { cn } from '@/lib/utils';
import { AppPaths } from '@/utils/appUtils';
import { type RecentChatShunt } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { HideCharacterChatButton } from '../Character/HideCharacterChatButton';
import { Button } from '../ui/button';

const NEW_KEY = 'new character';

const ListItemDropdown = ({
  character,
  handleDropdownOpenChange,
  itemDropdown,
}: {
  character: RecentChatShunt;
  handleDropdownOpenChange: (x: RecentChatShunt) => void;
  itemDropdown: string;
}) => {
  const isTouch = useIsTouchDevice();
  return (
    <DynamicDropdownMenu
      options={[
        {
          content: (
            <HideCharacterChatButton
              character_id={character.character_id}
              referrer="GuideRecentChats"
              handlePressCallback={() => {
                handleDropdownOpenChange(character);
              }}
            />
          ),
          asChild: true,
          key: `hide-${character.character_id}`,
        },
      ]}
      setIsOpen={() => handleDropdownOpenChange(character)}
      isOpen={character.character_id === itemDropdown}
      contentClassName="w-40"
      side="right"
    >
      <Button
        variant="ghost"
        className={cn(
          'min-w-unit-6 w-unit-6 h-unit-6 bg-transparent hover:bg-background opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all',
          { 'opacity-100': character.character_id === itemDropdown || isTouch },
        )}
        onPress={() => {
          handleDropdownOpenChange(character);
        }}
        size="sm"
        isIconOnly
        preventDefault
      >
        <BsThreeDots />
      </Button>
    </DynamicDropdownMenu>
  );
};

export function GuideRecentChats({
  recentCharacters,
  isRecentLoading,
  isError,
  refetch,
}: {
  recentCharacters: RecentChatShunt[];
  isRecentLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  const [itemDropdown, setItemDropdown] = useState('');

  const pathname = usePathname();
  const [selectedKey, setSelectedKey] = useState(null);
  const router = useRouter();
  const isTouch = useIsTouchDevice();

  const queryId = router.query.id;
  const isCharacterEditor =
    typeof queryId !== 'object' && pathname === AppPaths.character(queryId);

  const { charData } = useCharacterEditorContext();

  const characterEditItem = useMemo(() => {
    if (isCharacterEditor) {
      return charData
        ? {
            title: '',
            characters: [
              {
                id: charData.external_id,
                character_id: charData.external_id,
                name: charData.name,
                avatar_file_name: charData.avatar_file_name,
                date: new Date().toDateString(),
                isNeo: true,
                character_visibility: charData.visibility,
              } as RecentChatShunt,
            ],
          }
        : {
            title: '',
            characters: [
              {
                id: NEW_KEY,
                character_id: NEW_KEY,
                name: t('CharacterEditor.new-character'),
                avatar_file_name: '',
                date: new Date().toDateString(),
                isNeo: true,
                character_visibility: 'PRIVATE',
              } as RecentChatShunt,
            ],
          };
    }

    return undefined;
  }, [charData, isCharacterEditor]);

  const categorizedCharacters = useMemo(() => {
    const sections = categorizeCharacters(recentCharacters).filter(
      (x) => x.characters.length > 0,
    );

    if (characterEditItem) {
      return [characterEditItem, ...sections];
    }
    return sections;
  }, [recentCharacters, characterEditItem]);

  const isNewCharacterItemFocused = useCallback(
    (x: RecentChatShunt) =>
      x.id === NEW_KEY && AppPaths.character() === pathname,
    [pathname],
  );

  const isUpdateCharacterItemFocused = useCallback(
    (x: RecentChatShunt) => AppPaths.character(x.id) === pathname,
    [pathname],
  );

  const handleDropdownOpenChange = useCallback(
    (x: RecentChatShunt) => {
      setItemDropdown(itemDropdown === x.character_id ? '' : x.character_id);
    },
    [itemDropdown],
  );

  useEffect(() => {
    const selectedItem = recentCharacters.filter(
      (x) => AppPaths.chat(x.character_id) === pathname,
    )[0];
    if (selectedItem) {
      const set = new Set([selectedItem.character_id]);
      // @ts-expect-error -- react-aria is just wrong here, it's ok
      setSelectedKey(set);
    }
  }, [pathname, recentCharacters]);

  if (isRecentLoading) {
    return (
      <div className="flex flex-col overflow-hidden">
        <div className="overflow-hidden">
          {[...Array(5)].map((_, idx) => (
            <CharacterListItemCompactSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorView refresh={refetch} />;
  }

  return (
    <div className="flex flex-col overflow-hidden pt-2 md:pt-5 relative">
      <div className="text-foreground pb-2 hidden lg:block ml-5">
        <p className="text-small">{t('Guide.chats')}</p>
      </div>
      <Listbox
        emptyContent=""
        className={cn('overflow-x-auto p-4')}
        hideSelectedIcon
        selectionMode="single"
        selectedKey={selectedKey}
        // @ts-expect-error -- react-aria is just wrong here, it's ok
        onSelectionChange={setSelectedKey}
        color="secondary"
        variant="primary"
      >
        {categorizedCharacters.map(({ characters, title }) => (
          <ListboxSection key={title} title={title}>
            {characters.map((x) => (
              <ListboxItem
                className={cn(
                  'w-full mt-1 data-[hover=true]:bg-surface-elevation-2',
                  {
                    'bg-secondary':
                      AppPaths.chat(x.character_id) === pathname ||
                      isNewCharacterItemFocused(x) ||
                      isUpdateCharacterItemFocused(x),
                    'bg-surface-elevation-2': x.character_id === itemDropdown,
                  },
                )}
                isReadOnly={
                  isNewCharacterItemFocused(x) ||
                  isUpdateCharacterItemFocused(x)
                }
                aria-label={x.name}
                href={AppPaths.chat(x.character_id)}
                startContent={
                  <CharacterAvatar
                    name={isNewCharacterItemFocused(x) ? '' : x.name}
                    src={x.avatar_file_name}
                    size={32}
                    className={cn('shrink-0 grow-0', {
                      'border-1 border-accent': isNewCharacterItemFocused(x),
                    })}
                    backgroundOverride={
                      isNewCharacterItemFocused(x)
                        ? 'var(--background)'
                        : undefined
                    }
                  />
                }
                key={x.character_id}
              >
                <div className="w-full flex flex-row justify-between gap-1 items-center">
                  <p
                    className={cn('text-md group-hover:truncate', {
                      truncate: itemDropdown === x.character_id || isTouch,
                      'text-muted-foreground':
                        isNewCharacterItemFocused(x) ||
                        isUpdateCharacterItemFocused(x),
                    })}
                  >
                    {isUpdateCharacterItemFocused(x)
                      ? t('CharacterEditor.editing-character', { name: x.name })
                      : x.name}
                  </p>
                  {!isUpdateCharacterItemFocused(x) &&
                    !isNewCharacterItemFocused(x) && (
                      <ListItemDropdown
                        character={x}
                        handleDropdownOpenChange={handleDropdownOpenChange}
                        itemDropdown={itemDropdown}
                      />
                    )}
                </div>
              </ListboxItem>
            ))}
          </ListboxSection>
        ))}
      </Listbox>
    </div>
  );
}
