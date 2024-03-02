import { cn } from '@/lib/utils';
import { useState } from 'react';
import { type SwiperClass } from 'swiper/react';

export const usePaginationDashes = ({
  numItems,
  itemWidth,
  gapWidth,
  containerWidth,
}: {
  numItems: number;
  itemWidth: number;
  gapWidth: number;
  containerWidth: number;
}) => {
  const [snapIndex, setSnapIndex] = useState(0);
  const [numSnaps, setNumSnaps] = useState(0);
  const [snapDir, setSnapDir] = useState<'next' | 'prev'>('next');
  const [justSnappedEnd, setJustSnappedEnd] = useState(false);

  const handleSnapIndexChange = (swiper: SwiperClass) => {
    if (snapIndex < swiper.snapIndex) {
      setSnapDir('next');
      setJustSnappedEnd(false);
    } else {
      setSnapDir('prev');
      setJustSnappedEnd(snapIndex === numSnaps - 1);
    }
    setSnapIndex(swiper.snapIndex);

    if (swiper.isEnd) {
      setNumSnaps(swiper.snapIndex + 1);
    } else if (numSnaps === 0) {
      setNumSnaps(
        Math.floor(
          (numItems * itemWidth + gapWidth * (numItems - 1)) / containerWidth,
        ) + 1,
      );
    }
  };

  return {
    snapIndex,
    numSnaps,
    snapDir,
    justSnappedEnd,
    handleSnapIndexChange,
  };
};

export const PaginationDashes = ({
  index,
  total,
  dir,
  justSnappedEnd,
  className,
}: {
  index: number;
  total: number;
  dir: 'next' | 'prev';
  justSnappedEnd: boolean;
  className?: string;
}) => {
  const MAX = 4;
  const window = Math.min(MAX, total);

  const isActive = (thisIndex: number) => {
    if (total <= window) {
      return thisIndex === index;
    }
    // moving forward
    if (dir === 'next') {
      // have not gone outside of the window yet
      if (index < window - 1 && thisIndex === index) {
        return true;
      }
      // only set the last dash as active if we've reached the last page
      if (thisIndex === window - 1 && index === total - 1) {
        return true;
      }
      // otherwise, always have the second to last dash as active
      if (
        index >= window - 1 &&
        thisIndex === window - 2 &&
        index <= total - 2
      ) {
        return true;
      }
    } else if (dir === 'prev') {
      // if we just hit the end previously, we want to show the second to last dash as active
      if (justSnappedEnd) {
        return thisIndex === window - 2;
      }
      // this means we're near the beginning
      if (index <= 1 && index === thisIndex) {
        return true;
      }
      // always set the second dash to active if going backwards and we didn't just hit the end
      if (index > 1 && thisIndex === 1) {
        return true;
      }
    }
    return false;
  };

  // don't show any pagination if there's only one page
  if (window <= 1) {
    return null;
  }
  return (
    <div className={cn('flex flex-row gap-1', className)}>
      {new Array(window).fill(null).map((_elem: null, _index: number) => (
        <div
          key={_index}
          className={cn(
            'border-b-2 w-4',
            isActive(_index) ? 'border-b-primary' : 'border-b-accent',
          )}
        />
      ))}
    </div>
  );
};
