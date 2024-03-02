import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { DynamicDropdownMenu } from '../ui/DynamicDropdownMenu';
import { Button } from '../ui/button';
import { useMoreCharacterOptions } from './useMoreCharacterOptions';

export const CharacterDropdownOptions = ({
  thisIsMyCharacter,
  characterId,
  alwaysShow,
  contentClassName,
}: {
  thisIsMyCharacter: boolean;
  characterId: string;
  alwaysShow?: boolean;
  contentClassName?: string;
}) => {
  const options = useMoreCharacterOptions({
    characterId,
    thisIsMyCharacter,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!options.length) {
    return null;
  }
  return (
    <DynamicDropdownMenu
      options={options}
      setIsOpen={setDropdownOpen}
      isOpen={dropdownOpen}
      triggerClassName={alwaysShow ? 'opacity-100' : ''}
      contentClassName={contentClassName}
    >
      <Button
        variant={alwaysShow ? 'outline' : 'ghost'}
        color="secondary"
        isIconOnly
        preventDefault
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <BsThreeDots />
      </Button>
    </DynamicDropdownMenu>
  );
};
