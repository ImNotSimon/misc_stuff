import { type Character } from '@character-tech/client-common/src/types/app-api';
import { CategoryShelf } from './CategoryShelf';

export const HomeBottomShelf = ({
  categories,
  getCharactersByCategory,
}: {
  categories: string[];
  getCharactersByCategory: (category: string) => Character[];
}) => {
  const noCategories = !categories || !categories.length;

  if (noCategories) {
    return null;
  }

  return (
    <CategoryShelf
      categories={categories}
      getCharactersByCategory={getCharactersByCategory}
    />
  );
};
