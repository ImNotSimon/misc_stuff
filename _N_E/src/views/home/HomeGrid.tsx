import {
  PaginationDashes,
  usePaginationDashes,
} from '@/components/Common/PaginationDashes';
import { useDisableWheelScrollToNavBrowser } from '@/hooks/utils';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { FreeMode, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export const GridCol = <T,>({
  colElems,
  renderGridCard,
}: {
  colElems: T[];
  renderGridCard: (props: T) => JSX.Element;
}) => (
  <div className={cn('w-full flex flex-col gap-2')}>
    {colElems.map((props) => renderGridCard(props))}
  </div>
);

const gapWidth = 8;
export const HomeGrid = <T,>({
  grid,
  renderGridCard,
  hidePagination,
  itemWidth,
}: {
  grid: T[][];
  renderGridCard: (props: T) => JSX.Element;
  hidePagination?: boolean;
  itemWidth?: number;
}) => {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  useDisableWheelScrollToNavBrowser(swiperContainerRef);

  const {
    snapIndex,
    numSnaps,
    snapDir,
    justSnappedEnd,
    handleSnapIndexChange,
  } = usePaginationDashes({
    numItems: grid.length,
    gapWidth,
    itemWidth: itemWidth ?? 0,
    containerWidth: swiperContainerRef.current?.clientWidth ?? 1,
  });

  const swiperModules = [Mousewheel, Navigation, FreeMode];
  if (isMobile) {
    swiperModules.push(Pagination);
  }
  return (
    <div className="relative group w-full flex" ref={swiperContainerRef}>
      {!hidePagination && (
        <PaginationDashes
          className="invisible group-hover:visible absolute right-0 top-0 -mt-2"
          index={snapIndex}
          total={numSnaps}
          dir={snapDir}
          justSnappedEnd={justSnappedEnd}
        />
      )}
      <Swiper
        slidesPerView="auto"
        onSnapIndexChange={handleSnapIndexChange}
        spaceBetween={gapWidth}
        mousewheel={{
          forceToAxis: true,
        }}
        freeMode={isMobile}
        autoHeight={isMobile}
        cssMode={isMobile}
        modules={swiperModules}
        navigation={!isMobile}
        watchSlidesProgress
        className={cn('shelfSwiper', 'h-auto')}
      >
        {grid.map((colElems, index) => (
          <SwiperSlide
            key={`col-${index}`}
            style={{
              width: 'auto',
            }}
          >
            <GridCol colElems={colElems} renderGridCard={renderGridCard} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
