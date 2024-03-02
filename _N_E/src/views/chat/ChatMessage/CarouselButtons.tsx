import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { Button } from '@/components/ui/button';
import {
  ChevronLeftSmIcon,
  ChevronRightSmIcon,
  RotateIcon,
} from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export function CandidateNextButton({
  listIndex,
  listCount,
  swipe,
}: {
  listIndex: number;
  listCount: number;
  swipe: (back: boolean) => void;
}) {
  const lastCandidate = listCount === listIndex + 1;
  if (lastCandidate) {
    return null;
  }

  return (
    <Button
      autoFocus={false}
      isDisabled={lastCandidate}
      onPress={() => swipe(false)}
      className={cn(
        'h-8 w-8 min-w-unit-2 data-[hover=true]:bg-transparent',
        listCount === 2 ? 'h-8 w-8' : 'h-6 w-6 text-muted-foreground',
      )}
      isIconOnly
      variant="ghost"
    >
      {listCount === 2 && (
        <AnimationFadeInAndOut>
          <RotateIcon height="18px" width="18px" />
        </AnimationFadeInAndOut>
      )}
      {listCount > 2 && (
        <AnimationFadeInAndOut>
          <ChevronRightSmIcon height="16px" width="16px" />
        </AnimationFadeInAndOut>
      )}
    </Button>
  );
}
export function CandidatePrevButton({
  listIndex,
  swipe,
}: {
  listIndex: number;
  swipe: (back: boolean) => void;
}) {
  const maxTurns = 30;
  const firstCandidate = listIndex === 0;
  if (firstCandidate) {
    return null;
  }
  return (
    <div className="flex items-center">
      <Button
        autoFocus={false}
        isDisabled={firstCandidate}
        variant="ghost"
        isIconOnly
        className="h-6 w-6 min-w-unit-2 p-1 data-[hover=true]:bg-transparent text-muted-foreground "
        onPress={() => swipe(true)}
      >
        <ChevronLeftSmIcon height="16px" width="16px" />
      </Button>
      <p className="text-sm text-muted-foreground font-extralight">
        {listIndex + 1} / {maxTurns}
      </p>
    </div>
  );
}
