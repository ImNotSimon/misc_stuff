import { logAnalyticsEvent, logError } from '@/analytics/analytics';
import { formatLargeNumber } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { characterQueries } from '@character-tech/client-common/src/hooks/queries/baseQueries';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { useQueryClient } from '@character-tech/client-common/src/hooks/queries/setup';
import {
  useGetVotedFor,
  useUpdateCharacterVote,
} from '@character-tech/client-common/src/hooks/queries/social';
import { t } from 'i18next';
import { useMemo } from 'react';
import {
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
} from '../ui/Icon';
import { Separator } from '../ui/separator';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { AppToast } from '../ui/use-toast';

export enum VoteType {
  like = 'like',
  dislike = 'dislike',
}

const voteMap = {
  [VoteType.like]: true,
  [VoteType.dislike]: false,
};

export const CharacterVote = ({ characterId }: { characterId: string }) => {
  const { character } = useCharacterInfo(characterId ?? '');

  const { data: votedData } = useGetVotedFor(characterId);

  const { votedUp, votedDown } = useMemo(
    () => ({
      votedUp: !!votedData?.voted && !!votedData?.vote,
      votedDown: !!votedData?.voted && !votedData?.vote,
    }),
    [votedData?.voted, votedData?.vote],
  );

  const toggleButtonValue = useMemo(() => {
    if (votedUp) {
      return VoteType.like;
    }
    if (votedDown) {
      return VoteType.dislike;
    }
    return undefined;
  }, [votedUp, votedDown]);

  const { mutate: updateCharacterVote } = useUpdateCharacterVote();

  const queryClient = useQueryClient();

  const handleUpdateCharacterVote = (voteType: VoteType) => {
    const newVoteType = toggleButtonValue === voteType ? null : voteType;

    updateCharacterVote(
      {
        characterId,
        vote: newVoteType ? voteMap[newVoteType] : null,
      },
      {
        onSuccess: () => {
          logAnalyticsEvent(AnalyticsEvents.User.SocialAction, {
            referrer: 'CharacterVote',
            type: 'vote',
            characterId,
            voteType: newVoteType,
          });
          void queryClient.invalidateQueries(
            characterQueries.info.keys(characterId),
          );
        },
        onError: (error) => {
          AppToast(
            t('Error.something-went-wrong').toString(),
            undefined,
            'destructive',
          );
          logError('Failed to vote', { error });
        },
      },
    );
  };

  return (
    <CharacterVoteCore
      value={toggleButtonValue}
      onValueChange={handleUpdateCharacterVote}
      upvotes={character?.upvotes ?? 0}
    />
  );
};

export const CharacterVoteCore = ({
  value,
  onValueChange,
  upvotes,
}: {
  value: VoteType | undefined;
  onValueChange: (val: VoteType) => void;
  upvotes: number;
}) => (
  <ToggleGroup
    type="single"
    value={value}
    onValueChange={(val: string) => onValueChange(val as VoteType)}
    className="border-1 rounded-spacing-l border-surface-elevation-2 h-fit w-fit"
  >
    <ToggleGroupItem
      value={VoteType.like}
      aria-label={t('Common.like')}
      className="data-[state=on]:bg-transparent p-0 h-fit hover:bg-transparent flex flex-row gap-1 group/like py-3 pl-3"
    >
      {value === VoteType.like ? (
        <ThumbsUpFilledIcon
          height="16px"
          className="group-hover/like:text-muted-foreground text-icon-secondary"
        />
      ) : (
        <ThumbsUpIcon
          height="16px"
          className="group-hover/like:text-muted-foreground text-icon-secondary"
        />
      )}
      {!!upvotes && formatLargeNumber(upvotes)}
    </ToggleGroupItem>
    <Separator orientation="vertical" className="h-5 mx-1 p-0" />
    <ToggleGroupItem
      value={VoteType.dislike}
      aria-label={t('Common.dislike')}
      className="data-[state=on]:bg-transparent p-0 h-fit hover:bg-transparent group/dislike py-3 pr-3"
    >
      {value === VoteType.dislike ? (
        <ThumbsDownFilledIcon
          height="16px"
          className="group-hover/dislike:text-muted-foreground text-icon-secondary"
        />
      ) : (
        <ThumbsDownIcon
          height="16px"
          className="group-hover/dislike:text-muted-foreground text-icon-secondary"
        />
      )}
    </ToggleGroupItem>
  </ToggleGroup>
);
