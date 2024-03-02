import { api } from '@/utils/api';

export default function useUser() {
  const { data: user, isLoading } = api.user.get.useQuery();

  return {
    user: user ?? null,
    isLoading,
  };
}
