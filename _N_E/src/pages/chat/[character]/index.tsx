import { type NextPageWithLayout } from '@/pages/_app';
import { prefetchQueries } from '@/server/prefetchHelper';
import { ssgPrefetch } from '@/utils/ssgPrefetch';
import { ChatView } from '@/views/chat/Chat.view';
import { ChatViewSignedOut } from '@/views/chat/ChatSignedOut.view';
import { characterQueries } from '@character-tech/client-common/src/hooks/queries/baseQueries';
import { socialKeys } from '@character-tech/client-common/src/hooks/queries/social';
import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from 'next';

export const runtime = 'experimental-edge';

export const getServerSideProps = (async (context) => {
  const { token, user, ssg } = await ssgPrefetch(context);

  const queryClient = new QueryClient();

  const characterId = context.params?.character as string;
  const historyOverride = (context.query?.hist as string) ?? null;

  if (!characterId) {
    return {
      notFound: true,
    };
  }

  const queriesToPrefetch = [
    {
      key: characterQueries.info.keys(characterId),
      fn: async () => {
        const data = await ssg.character.info.fetch({
          externalId: characterId,
        });

        return {
          data,
          isFetched: true,
          isLoading: false,
        };
      },
    },
    {
      key: socialKeys.votedFor(characterId),
      fn: async () => {
        const data = await ssg.social.getVotedFor.fetch({
          characterId,
        });
        return { ...data, isFetched: true, isLoading: false };
      },
    },
  ];

  await prefetchQueries(queryClient, context, queriesToPrefetch);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      token,
      user,
      characterId,
      historyOverride,
    },
  };
}) satisfies GetServerSideProps<{
  dehydratedState: DehydratedState;
}>;

// eslint-disable-next-line react/function-component-definition
const Chat: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => (
  <ChatView {...props} />
);

Chat.SignedOut = ChatViewSignedOut;

export default Chat;
