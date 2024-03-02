import { CharacterEditorView } from '@/components/Character/CharacterEditor/CharacterEditorView';
import { useCharacterEditorContext } from '@/context/CharacterEditorContext';
import { ssgPrefetch } from '@/utils/ssgPrefetch';
import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import { type GetServerSideProps } from 'next';
import { useEffect } from 'react';

export const runtime = 'experimental-edge';

export const getServerSideProps = (async (context) => {
  const { token, user } = await ssgPrefetch(context);

  const queryClient = new QueryClient();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      token,
      user,
    },
  };
}) satisfies GetServerSideProps<{
  dehydratedState: DehydratedState;
}>;

export default function CharacterCreator() {
  const { setCanEditCharacter } = useCharacterEditorContext();

  useEffect(() => setCanEditCharacter(true), [setCanEditCharacter]);

  return <CharacterEditorView />;
}
