import { t } from 'i18next';
import { HomeGrid } from './HomeGrid';
import { UseCaseCard } from './UseCaseCard';

export const useCaseGrid = [
  [
    {
      characterId: '2T3Xhqf5B_b9Wrn8Bg0FeCYR7BPx2LtJQJJCIB4Qe18',
      label: t('Feed.UseCases.practice-a-new-language'),
    },
    {
      characterId: 'uD71krOYYFjVkYwspviH_8tYTybsf5eAGdwhNlFJAls',
      label: t('Feed.UseCases.plan-a-trip'),
    },
  ],
  [
    {
      characterId: 'f4hEGbw8ywUrjsrye03EJxiBdooy--HiOWgU2EiRJ0s',
      label: t('Feed.UseCases.practice-interviewing'),
    },
    {
      characterId: '9ZSDyg3OuPbFgDqGwy3RpsXqJblE4S1fKA_oU3yvfTM',
      label: t('Feed.UseCases.write-a-story'),
    },
  ],
  [
    {
      characterId: 'Hu84TYGgte3qVoQuy75x6Q1-ORjQbgoe2qaFoTkjaOM',
      label: t('Feed.UseCases.brainstorm-ideas'),
    },
    {
      characterId: 'M5xMXf4FKepKTYtWPqVaEZzuEuy90uu0eNZr4GZtDsA',
      label: t('Feed.UseCases.play-a-game'),
    },
  ],
  [
    {
      characterId: 'WLcau8HDbkAPlnU9GPZvLVQ4QaWMhktCmgGFgG2nb5c',
      label: t('Feed.UseCases.get-book-recommendations'),
    },
    {
      characterId: '9wIR0NXzqD76sfJWRsHCGGb8IkPljhINj8WDy_2xjcg',
      label: t('Feed.UseCases.help-me-make-a-decision'),
    },
  ],
];

const renderGridCard = (props: { characterId: string; label: string }) => (
  <UseCaseCard key={props.characterId} {...props} />
);
export const HomeUseCases = () => (
  <div className="w-full flex flex-col gap-4 mb-4">
    <p className="ml-4">{t('Feed.try-these')}</p>
    <HomeGrid
      grid={useCaseGrid}
      renderGridCard={renderGridCard}
      hidePagination
    />
  </div>
);
