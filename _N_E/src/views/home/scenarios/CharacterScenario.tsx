import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { FancyCard } from '@/components/Common/FancyCard';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { api } from '@/utils/api';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';

export function CharacterScenarioTile({
  characterId,
}: {
  characterId: string;
}) {
  const { data } = api.character.info.useQuery(
    {
      externalId: characterId,
    },
    {
      enabled: !!characterId,
    },
  );

  const character = data?.character;

  return (
    <FancyCard>
      {!!character && (
        <LinkWithAnalytics
          href={AppPaths.chat(character.external_id)}
          className="flex flex-col gap-4 h-full w-full group"
          analyticsProps={{
            eventName: AnalyticsEvents.UX.CharacterSelected,
            properties: {
              characterId: character.external_id,
              referrer: 'CharacterScenario',
            },
          }}
        >
          <div className="flex gap-2">
            <CharacterAvatar
              name={character.name}
              size={48}
              src={character.avatar_file_name}
            />
            <div>{character.name}</div>
          </div>
          <div className="flex flex-col justify-between h-full flex-1">
            <div className="max-h-36 overflow-hidden line-clamp-3 text-lg">
              {character.greeting ?? character.title}
            </div>
            <div className="text-muted-foreground font-sans font-light group-hover:text-foreground">
              {t('Common.reply')}
            </div>
          </div>
        </LinkWithAnalytics>
      )}
    </FancyCard>
  );
}
