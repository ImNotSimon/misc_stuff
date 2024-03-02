import { type NextPageWithLayout } from '@/pages/_app';
import { prefetchQueries } from '@/server/prefetchHelper';
import { AppUtils } from '@/utils/appUtils';
import { ssgPrefetch } from '@/utils/ssgPrefetch';
import { ProfileView } from '@/views/profile/Profile.view';
import { userQueries } from '@character-tech/client-common/src/hooks/queries/baseQueries';
import { personaKeys } from '@character-tech/client-common/src/hooks/queries/persona';
import { socialKeys } from '@character-tech/client-common/src/hooks/queries/social';
import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import Error from 'next/error';
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from 'next/types';

export const runtime = 'experimental-edge';

export const getServerSideProps = (async (context) => {
  const { token, user, ssg } = await ssgPrefetch(context);
  const queryClient = new QueryClient();
  const username = AppUtils.slugToString(context.query.username);
  const thisIsMe = user?.user?.username === username;

  if (!username) {
    return {
      notFound: true,
    };
  }

  const prefetchedPublicUser = await ssg.social.publicProfile.fetch({
    username,
    thisIsMe,
  });

  const queriesToPrefetch: {
    key: readonly (string | boolean)[];
    fn: () => Promise<unknown>;
  }[] = [
    {
      fn: async () => ({
        ...prefetchedPublicUser,
        isFetched: true,
        isLoading: false,
      }),
      key: socialKeys.publicUser(username),
    },
  ];

  if (thisIsMe) {
    const { data: userPersonasData } = await ssg.persona.userPersonas.fetch();
    queriesToPrefetch.push({
      fn: async () => ({
        data: userPersonasData,
        isFetched: true,
        isLoading: false,
      }),
      key: personaKeys.personas(),
    });

    const { data: userSettingsData } = await ssg.user.userSettings.fetch();
    queriesToPrefetch.push({
      fn: async () => ({
        data: userSettingsData,
        isFetched: true,
        isLoading: false,
      }),
      key: userQueries.settings.keys(),
    });

    const likedCharactersData = await ssg.social.upvotedCharacters.fetch();
    queriesToPrefetch.push({
      fn: async () => likedCharactersData.characters,
      key: socialKeys.upvotedCharacters(),
    });
  }

  await prefetchQueries(queryClient, context, queriesToPrefetch);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      token,
      user,
      prefetchedPublicUser,
    },
  };
}) satisfies GetServerSideProps<{
  dehydratedState: DehydratedState;
}>;

// eslint-disable-next-line react/function-component-definition
const Profile: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { prefetchedPublicUser } = props;
  return prefetchedPublicUser ? (
    <ProfileView publicUser={prefetchedPublicUser} />
  ) : (
    <Error statusCode={404} />
  );
};

Profile.SignedOut = Profile;

export default Profile;
