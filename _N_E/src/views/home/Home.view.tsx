'use client';

import { HomeCreateCharacterFooter } from '@/views/home/HomeCreateCharacterFooter';
import { HeroScenarios } from '@/views/home/scenarios/HeroScenariosShelf';
import {
  useCharactersByCuratedCategory,
  useFeaturedCharacters,
  useRecommendedCharacters,
} from '@character-tech/client-common/src/hooks/queries/discovery';
import { useGetCharactersVotes } from '@character-tech/client-common/src/hooks/queries/social';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useCallback, useMemo } from 'react';
import { HomeExampleChats } from './HomeExampleChats';
import { HomeUseCases } from './HomeUseCases';
import { HomeBottomShelf } from './shelves/HomeBottomShelf';
import { HomeShelf } from './shelves/HomeShelf';

const deduplicateFromPrevCharacters = (
  prevCharacters: Character[],
  curList: Character[],
) => {
  const prevIds = prevCharacters.map((c) => c.external_id);
  const finalList = curList.filter((c) => !prevIds.includes(c.external_id));
  return finalList;
};

const reformatWithUpvotes = (
  upvotesMap: { [external_id: string]: number },
  characters?: Character[],
) =>
  (characters ?? []).map((c) => ({
    ...c,
    upvotes: upvotesMap?.[c.external_id] ?? 0,
  }));

interface HomeViewCoreProps {
  topShelf?: {
    title: string;
    characters: Character[] | undefined;
  };
  shelves: {
    title: string;
    characters: Character[] | undefined;
  }[];
  charactersByCategory?: Record<string, Character[]> | undefined;
}

export const HomeViewCore = ({
  topShelf,
  shelves,
  charactersByCategory,
}: HomeViewCoreProps) => {
  const categories = useMemo(() => {
    const lst = Object.keys(charactersByCategory ?? {}).filter(
      (category) => (charactersByCategory?.[category] ?? []).length > 0,
    );

    return lst;
  }, [charactersByCategory]);

  const getCharactersByCategory: (category: string) => Character[] =
    useCallback(
      (category: string) => charactersByCategory?.[category] ?? [],
      [charactersByCategory],
    );

  return (
    <div className="pl-2 md:pl-0">
      <HeroScenarios />
      {!!topShelf && (
        <li className="mb-6" key={topShelf.title}>
          <HomeShelf characters={topShelf.characters} title={topShelf.title} />
        </li>
      )}
      <HomeUseCases />
      {shelves.map((shelf) => (
        <li className="mb-6" key={shelf.title}>
          <HomeShelf characters={shelf.characters} title={shelf.title} />
        </li>
      ))}
      <HomeBottomShelf
        categories={categories}
        getCharactersByCategory={getCharactersByCategory}
      />
      <HomeExampleChats />
      <HomeCreateCharacterFooter />
    </div>
  );
};

export function HomeView() {
  const { charactersByCategory } = useCharactersByCuratedCategory(true);
  const { featuredCharacters } = useFeaturedCharacters(true);
  const { recommendedCharacters } = useRecommendedCharacters(true);

  const dedupedFeaturedCharacters = useMemo(
    () =>
      deduplicateFromPrevCharacters(
        recommendedCharacters ?? [],
        featuredCharacters ?? [],
      ),
    [recommendedCharacters, featuredCharacters],
  );

  // get upvotes
  const { data: upvotesDataRecommended } = useGetCharactersVotes(
    recommendedCharacters?.map((c) => c.external_id) ?? [],
    'Recommended',
  );
  const { data: upvotesDataFeatured } = useGetCharactersVotes(
    featuredCharacters?.map((c) => c.external_id) ?? [],
    'Featured',
  );
  // reformat with upvotes
  const recommendedCharactersWithUpvotes = useMemo(
    () =>
      reformatWithUpvotes(
        upvotesDataRecommended?.upvotes_per_character ?? {},
        recommendedCharacters,
      ),
    [recommendedCharacters, upvotesDataRecommended],
  );
  const featuredCharactersWithUpvotes = useMemo(
    () =>
      reformatWithUpvotes(
        upvotesDataFeatured?.upvotes_per_character ?? {},
        dedupedFeaturedCharacters,
      ),
    [dedupedFeaturedCharacters, upvotesDataFeatured],
  );

  const topShelf = useMemo(() => {
    if ((recommendedCharactersWithUpvotes ?? []).length) {
      return {
        title: t('Feed.for-you'),
        characters: recommendedCharactersWithUpvotes,
      };
    }
  }, [recommendedCharactersWithUpvotes]);

  const shelves = useMemo(() => {
    const arr = [];

    if (featuredCharactersWithUpvotes.length) {
      arr.push({
        title: t('Feed.featured'),
        characters: featuredCharactersWithUpvotes,
      });
    }
    return arr;
  }, [featuredCharactersWithUpvotes]);

  return (
    <HomeViewCore
      topShelf={topShelf}
      shelves={shelves}
      charactersByCategory={charactersByCategory}
    />
  );
}
