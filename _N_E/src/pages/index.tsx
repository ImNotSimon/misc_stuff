import { DeploymentSelector } from '@/components/Canary/DeploymentSelector';
import { Footer } from '@/components/Common/Footer';
import { cn } from '@/lib/utils';
import { prefetchQueries } from '@/server/prefetchHelper';
import { ssgPrefetch } from '@/utils/ssgPrefetch';
import { HomeView } from '@/views/home/Home.view';
import { exampleChatElems } from '@/views/home/HomeExampleChats';
import { HomeHeader } from '@/views/home/HomeHeader';
import { useCaseGrid } from '@/views/home/HomeUseCases';
import {
  characterQueries,
  discoveryQueries,
} from '@character-tech/client-common/src/hooks/queries/baseQueries';
import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import { t } from 'i18next';
import { type GetServerSideProps } from 'next';
import { type ReactElement } from 'react';
import { isMobile } from 'react-device-detect';
import { type NextPageWithLayout } from './_app';

export const runtime = 'experimental-edge';

export const getServerSideProps = (async (context) => {
  const { token, user, ssg } = await ssgPrefetch(context);
  const queryClient = new QueryClient();

  const queries = [];

  queries.push(
    {
      fn: async () => {
        const data = await ssg.discovery.featured.fetch();
        return { data, isFetched: true, isLoading: false };
      },
      key: discoveryQueries.featured.keys(),
    },
    {
      fn: async () => {
        const data = await ssg.discovery.curated.fetch();
        return { data, isFetched: true, isLoading: false };
      },
      key: discoveryQueries.curated.keys(),
    },
  );

  // TODO (@david): disable recent and recommended prefetching for now
  // if (user) {
  // queries.push(
  // {
  //   fn: async () => {
  //     const data = await ssg.discovery.recommended.fetch({});
  //     return { data, isFetched: true, isLoading: false };
  //   },
  //   key: discoveryQueries.recommended.keys(),
  // },
  // {
  //   fn: async () => {
  //     const data = await ssg.discovery.recent.fetch({ neoEnabled: true });
  //     return JSON.parse(JSON.stringify(data));
  //   },
  //   key: discoveryQueries.recent.keys(true),
  // },
  // );
  // }

  // fetch use case characters and example chats characters
  const useCaseCharacterIds = useCaseGrid.flatMap((col) =>
    col.map((elem) => elem.characterId),
  );
  const exampleChatsCharacterIds = exampleChatElems.flatMap(
    (elem) => elem.characterId,
  );
  const characterInfoQueries = [
    ...new Set([...useCaseCharacterIds, ...exampleChatsCharacterIds]),
  ].map((characterId: string) => ({
    fn: async () => {
      const data = await ssg.character.infoCached.fetch({
        externalId: characterId,
      });
      return { data, isFetched: true, isLoading: false };
    },
    key: characterQueries.info.keys(characterId),
  }));

  await prefetchQueries(queryClient, context, [
    ...queries,
    ...characterInfoQueries,
  ]);

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

// eslint-disable-next-line react/function-component-definition
const Home: NextPageWithLayout = () => <HomeView />;

Home.getLayout = function getLayout(home: ReactElement) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-between px-4 sm:px-8 pt-6',
        { 'px-0': isMobile },
      )}
    >
      <title>{t('Home.title')}</title>
      <div className="max-w-7xl self-center w-full">
        <HomeHeader />
        <ol className="flex flex-col pt-6">{home}</ol>
      </div>
      <div className="mt-24 py-10">
        <Footer />
        <DeploymentSelector />
      </div>
    </div>
  );
};

Home.SignedOut = HomeView;

export default Home;
