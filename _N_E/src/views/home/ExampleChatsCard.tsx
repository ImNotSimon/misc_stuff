import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { CreatorLink } from '@/components/Common/CreatorLink';
import { NumCharacterAttribute } from '@/components/Common/NumCharacterAttribute';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';

export const createExampleKey = (questionKey: string, idx: number) =>
  t(`Feed.ExampleChats.${questionKey}.q${idx}`);

const createExamples = (questionKey: string) => {
  const questionIndices = [...Array(3).keys()];
  return questionIndices.map((idx) => createExampleKey(questionKey, idx));
};

export const EXAMPLE_CHATS_CARD_WIDTH = 412;

export const ExampleChatsCardCore = ({
  name,
  src,
  creatorUsername,
  numInteractions,
  questionKey,
  characterId,
  upvotes,
}: {
  name: string;
  src: string;
  creatorUsername: string;
  numInteractions: number;
  questionKey: string;
  characterId: string;
  upvotes?: number;
}) => (
  <div
    className="flex flex-col gap-2 p-4 items-start bg-surface-elevation-1 hover:brightness-105 rounded-spacing-s"
    style={{ width: EXAMPLE_CHATS_CARD_WIDTH }}
  >
    <div className="flex flex-row gap-2">
      <CharacterAvatar name={name} size={54} src={src} />
      <div>
        <p>{name}</p>
        <span className="flex flex-row gap-1 text-muted-foreground text-sm">
          <CreatorLink author={creatorUsername} createdBy={false} />
          <NumCharacterAttribute
            type="interactions"
            num={numInteractions}
            withPrecedingDot
          />
          {!!upvotes && (
            <NumCharacterAttribute
              type="upvotes"
              num={upvotes}
              withPrecedingDot
            />
          )}
        </span>
      </div>
    </div>
    <div className="w-full flex flex-col gap-1">
      {createExamples(questionKey).map((example, index) => {
        const link = AppPaths.chat(
          characterId,
          new URLSearchParams({
            questionKey,
            index: index.toString(),
          }).toString(),
        );
        return (
          <LinkWithAnalytics
            className="w-full rounded-spacing-s p-4 bg-surface-elevation-3 hover:brightness-105"
            href={link}
            analyticsProps={{
              eventName: AnalyticsEvents.Links.Handled,
              properties: {
                link,
                referrer: 'ExampleChatsCard',
                type: example,
              },
            }}
            key={`${characterId}-example-${index}`}
          >
            <p className="line-clamp-1 text-ellipsis text-primary text-md">
              {example}
            </p>
          </LinkWithAnalytics>
        );
      })}
    </div>
  </div>
);

export const ExampleChatsCard = ({
  characterId,
  questionKey,
}: {
  characterId: string;
  questionKey: string;
}) => {
  const { character } = useCharacterInfo(characterId);

  if (!character) {
    return (
      <Skeleton
        className="h-[260px] rounded-spacing-s"
        style={{
          width: `${EXAMPLE_CHATS_CARD_WIDTH}px`,
        }}
      />
    );
  }
  const {
    name,
    avatar_file_name: src,
    user__username: creatorUsername,
    participant__num_interactions: numInteractions,
    upvotes,
  } = character;

  return (
    <ExampleChatsCardCore
      name={name}
      src={src}
      creatorUsername={creatorUsername}
      numInteractions={numInteractions}
      upvotes={upvotes}
      questionKey={questionKey}
      characterId={characterId}
    />
  );
};
