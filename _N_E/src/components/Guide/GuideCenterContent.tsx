import { GuideRecentChats } from '@/components/Guide/GuideRecentChats';
import { useAuth } from '@/context/AuthContext';
import { useRecentCharacters } from '@character-tech/client-common/src/hooks/queries/discovery';

export function GuideCenterContent() {
  const { user } = useAuth();

  return user ? <GuideCenterContentSignedIn /> : null;
}

function GuideCenterContentSignedIn() {
  const {
    recentCharacters,
    isLoading: isRecentLoading,
    isError,
    refetch,
  } = useRecentCharacters(true, true);

  return (
    <GuideRecentChats
      isRecentLoading={isRecentLoading}
      recentCharacters={recentCharacters ?? []}
      isError={isError}
      refetch={refetch}
    />
  );
}
