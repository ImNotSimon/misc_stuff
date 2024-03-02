import { CharacterListItemStandard } from '@/components/Character/CharacterListItemStandard';
import { AppPaths } from '@/utils/appUtils';
import { type Character } from '@character-tech/client-common/src/types/app-api';

export const CharacterList = ({
  characters,
  noCharacterText,
  thisUsername,
  referrer,
}: {
  characters?: Character[];
  noCharacterText: string;
  thisUsername?: string;
  referrer: string;
}) => {
  if (!characters?.length) {
    return <span>{noCharacterText}</span>;
  }
  return characters.map((character) => (
    <CharacterListItemStandard
      referrer={referrer}
      key={character.external_id}
      name={character.participant__name}
      href={AppPaths.chat(character.external_id)}
      src={character.avatar_file_name}
      title={character.title}
      interactions={character.participant__num_interactions}
      upvotes={character.upvotes}
      optionsProps={{
        thisIsMyCharacter: character.user__username === thisUsername,
        characterId: character.external_id,
      }}
    />
  ));
};
