import { ssgPrefetch } from '@/utils/ssgPrefetch';
import { SignupView } from '@/views/signup/Signup.view';
import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import { type GetServerSideProps } from 'next';

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

export default function Signup() {
  return <SignupView />;
}
