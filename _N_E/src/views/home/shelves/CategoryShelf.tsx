import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisableWheelScrollToNavBrowser } from '@/hooks/utils';
import { cn } from '@/lib/utils';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { FreeMode, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { HomeShelf } from './HomeShelf';

interface CategoryShelfProps {
  categories: string[];
  getCharactersByCategory: (category: string) => Character[];
}

export const CategoryShelf = ({
  categories,
  getCharactersByCategory,
}: CategoryShelfProps) => {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  useDisableWheelScrollToNavBrowser(swiperContainerRef);

  const swiperModules = [Mousewheel, Navigation, FreeMode];

  if (isMobile) {
    swiperModules.push(Pagination);
  }

  return (
    <Tabs
      defaultValue={categories[0]}
      className="w-full flex flex-col mt-2"
      tabIndex={-1}
    >
      <TabsList
        className="w-full flex justify-start items-start"
        ref={swiperContainerRef}
      >
        <Swiper
          slidesPerView="auto"
          spaceBetween={8}
          mousewheel={{
            forceToAxis: true,
          }}
          freeMode
          autoHeight={isMobile}
          cssMode={isMobile}
          navigation={!isMobile}
          modules={swiperModules}
          className={cn('shelfSwiper', 'w-full')}
          watchSlidesProgress
        >
          {categories.map((category) => (
            <SwiperSlide
              key={category}
              style={{
                width: 'auto',
              }}
            >
              <TabsTrigger
                value={category}
                className="mb-6 border-b-none rounded-spacing-s my-0 p-3 data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=inactive]:bg-surface-elevation-2"
              >
                {t(`Feed.Categories.${category}`)}
              </TabsTrigger>
            </SwiperSlide>
          ))}
        </Swiper>
      </TabsList>
      {categories.map((category) => {
        const characters = getCharactersByCategory(category);
        if (!characters.length) {
          return null;
        }
        return (
          <TabsContent value={category} key={category} className="w-full">
            <li className="mb-6">
              <HomeShelf characters={characters} title={category} hideTitle />
            </li>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
