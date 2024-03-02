import { DynamicDropdownMenu } from '@/components/ui/DynamicDropdownMenu';
import { Button } from '@/components/ui/button';
import { type ContextItem } from '@/components/ui/ui-types';
import { cn } from '@/lib/utils';
import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { PersonaAvatar } from '../Profile/PersonaAvatar';

export function PersonaListItem({
  persona,
  isDefault,
  handleItemClick,
  handleEditClick,
  selected,
  menuOptions,
  avatarSize,
  ...props
}: {
  persona: CharacterDetailed;
  isDefault: boolean;
  handleItemClick?: () => void;
  handleEditClick?: () => void;
  selected?: boolean;
  menuOptions?: ContextItem[];
  avatarSize?: number;
}) {
  const [openMenuOptions, setOpenMenuOptions] = useState(false);

  const { participant__name: name, definition } = persona;

  const handleButtonEdit = () => {
    if (handleEditClick) {
      handleEditClick();
    }
  };

  return (
    <div
      className={cn(
        'my-1 flex w-full h-fit group flex-row gap-3 p-2 items-center rounded-spacing-xs text-primary hover:cursor-pointer',
        handleEditClick && (isDefault || selected)
          ? 'bg-accent'
          : 'bg-transparent',
        handleEditClick ? 'hover:bg-accent' : 'hover:bg-surface-elevation-3',
      )}
      onClick={() => handleItemClick && handleItemClick()}
      {...props}
    >
      <PersonaAvatar persona={persona} size={avatarSize ?? 40} circle />
      <div className="flex flex-1 flex-col w-full max-w-full justify-center">
        <div className="flex flex-1 gap-2 items-center">
          <p className="line-clamp-1 text-ellipsis break-anywhere">{name}</p>
          {!!(isDefault || selected) && (
            <p className="text-blue">
              {isDefault ? t('Common.default') : t('Common.active')}
            </p>
          )}
        </div>
        <p className="text-left text-md mb-1 line-clamp-1 text-ellipsis break-anywhere text-muted-foreground">
          {definition}
        </p>
      </div>
      {!!handleEditClick && (
        <Button
          onPress={handleButtonEdit}
          className="hidden group-hover:block"
          variant="primary"
          preventDefault
        >
          {t('Common.edit')}
        </Button>
      )}
      {!!menuOptions && menuOptions.length > 0 && (
        <div className="z-50">
          <DynamicDropdownMenu
            options={menuOptions}
            setIsOpen={setOpenMenuOptions}
            isOpen={openMenuOptions}
          >
            <Button
              variant="ghost"
              isIconOnly
              preventDefault
              onPress={() => setOpenMenuOptions(!openMenuOptions)}
            >
              <BsThreeDots />
            </Button>
          </DynamicDropdownMenu>
        </div>
      )}
    </div>
  );
}
