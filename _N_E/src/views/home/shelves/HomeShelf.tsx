import {
  PaginationDashes,
  usePaginationDashes,
} from '@/components/Common/PaginationDashes';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { useDisableWheelScrollToNavBrowser } from '@/hooks/utils';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import { useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { FreeMode, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  CHARACTER_CARD_WIDTH,
  CharacterCard,
  type CharacterCardProps,
} from './CharacterCard';
import { CharacterSkeletonCard } from './CharacterSkeletonCard';

export type HomeShelfCharacterProps = Omit<CharacterCardProps, 'image'> &
  Pick<
    Character,
    'external_id' | 'avatar_file_name' | 'participant__name' | 'upvotes'
  >;

export type HomeShelfProps = {
  characters: HomeShelfCharacterProps[] | undefined;
  title: string;
  hideTitle?: boolean;
};

const gapWidth = 8;

export function HomeShelf({ characters, title, hideTitle }: HomeShelfProps) {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  useDisableWheelScrollToNavBrowser(swiperContainerRef);

  const {
    snapIndex,
    numSnaps,
    snapDir,
    justSnappedEnd,
    handleSnapIndexChange,
  } = usePaginationDashes({
    numItems: (characters ?? []).length,
    gapWidth,
    itemWidth: CHARACTER_CARD_WIDTH,
    containerWidth: swiperContainerRef.current?.clientWidth ?? 1,
  });

  if (characters == null || characters.length === 0) {
    const slides = new Array(10).fill(0).map((_, i) => (
      <div key={`$loading-${i}`}>
        <CharacterSkeletonCard />
      </div>
    ));
    return (
      <div className="flex flex-row overflow-hidden space-x-2">{slides}</div>
    );
  }

  const swiperModules = [Mousewheel, Navigation, FreeMode];

  if (isMobile) {
    swiperModules.push(Pagination);
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4 ml-4">
        {!hideTitle && <p>{title}</p>}
        <div />
      </div>
      <div className="relative group" ref={swiperContainerRef}>
        <PaginationDashes
          className="invisible group-hover:visible absolute right-0 top-0 -mt-2"
          index={snapIndex}
          total={numSnaps}
          dir={snapDir}
          justSnappedEnd={justSnappedEnd}
        />
        <Swiper
          onSnapIndexChange={handleSnapIndexChange}
          slidesPerView="auto"
          spaceBetween={gapWidth}
          mousewheel={{
            forceToAxis: true,
          }}
          freeMode
          autoHeight={isMobile}
          cssMode={isMobile}
          navigation
          modules={swiperModules}
          className="shelfSwiper"
          watchSlidesProgress
        >
          {characters.map((character) => (
            <SwiperSlide
              key={character.external_id}
              style={{
                width: isMobile ? 'fit-content' : 'auto',
              }}
            >
              <LinkWithAnalytics
                href={AppPaths.chat(character.external_id)}
                aria-label={`Character: ${character.participant__name}`}
                analyticsProps={{
                  eventName: AnalyticsEvents.UX.CharacterSelected,
                  properties: {
                    characterId: character.external_id,
                    referrer: 'HomeShelf',
                  },
                }}
                className="flex w-fit group"
              >
                <CharacterCard
                  {...character}
                  image={character.avatar_file_name}
                  name={character.name || character.participant__name}
                />
              </LinkWithAnalytics>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
