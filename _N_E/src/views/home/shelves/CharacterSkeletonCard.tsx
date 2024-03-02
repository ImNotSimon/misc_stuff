import { Skeleton } from '@/components/ui/skeleton';

export function CharacterSkeletonCard() {
  return (
    <div className="w-[291px] h-[154px] bg-surface-elevation-2 rounded-3xl">
      <div className="p-4 flex flex-row h-full space-x-3">
        <Skeleton className="w-[90px] h-[122px] rounded-2xl" />
        <div className="h-full w-full overflow-auto space-y-2">
          <Skeleton className="h-4 w-full " />
          <Skeleton className="h-4 w-full" />
          <div className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
