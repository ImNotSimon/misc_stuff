'use client';

import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import { createContext, useContext, useMemo, useState } from 'react';

/**
 * The actions related to voice.
 */
export interface CharacterEditorContextType {
  /** whether or not the current character can be edited */
  canEditCharacter: boolean;
  setCanEditCharacter: (val: boolean) => void;
  /** character data of the edited character */
  charData: CharacterDetailed | undefined;
  setCharData: (val: CharacterDetailed | undefined) => void;
}

export const CharacterEditorContext = createContext<CharacterEditorContextType>(
  {
    canEditCharacter: false,
    setCanEditCharacter: () => null,
    charData: undefined,
    setCharData: () => null,
  },
);

interface CharacterEditorProviderProps {
  children: React.ReactNode;
}

/**
 * Provides the character editor context that allows the user to create or
 * edit a character
 *
 */
export function CharacterEditorContextProvider({
  children,
}: CharacterEditorProviderProps) {
  const [canEditCharacter, setCanEditCharacter] = useState(false);
  const [charData, setCharData] = useState<CharacterDetailed | undefined>(
    undefined,
  );

  const ctx = useMemo(
    () => ({
      canEditCharacter,
      setCanEditCharacter,
      setCharData,
      charData,
    }),
    [canEditCharacter, setCanEditCharacter, setCharData, charData],
  );

  return (
    <CharacterEditorContext.Provider value={ctx}>
      {children}
    </CharacterEditorContext.Provider>
  );
}

export const useCharacterEditorContext = () =>
  useContext(CharacterEditorContext);
