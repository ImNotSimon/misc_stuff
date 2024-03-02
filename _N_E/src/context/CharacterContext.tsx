import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { useRouter } from 'next/router';
import { createContext, useContext, useMemo } from 'react';
import { z } from 'zod';

export interface CharacterContextType {
  characterId: string;
}

export const CharacterContext = createContext<CharacterContextType>({
  characterId: '',
});

export function CharacterContextProvider({
  characterId,
  children,
}: CharacterContextType & { children: React.ReactNode }) {
  const value = useMemo<CharacterContextType>(
    () => ({
      characterId,
    }),
    [characterId],
  );
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

const CharacterRouteQueryType = z.object({
  character: z.string(),
});

export function CharacterContextProviderFromUrl({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const query = CharacterRouteQueryType.safeParse(router.query);
  const characterId = query.success ? query.data.character : '';
  return (
    <CharacterContextProvider characterId={characterId}>
      {children}
    </CharacterContextProvider>
  );
}

export function useCharacter() {
  const { characterId } = useContext(CharacterContext);
  const { character } = useCharacterInfo(characterId ?? '');

  return {
    character,
    characterId,
  };
}
