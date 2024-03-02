import { neoAPI } from '@character-tech/client-common/src/chatManager/neoAPI';
import { useQuery } from '@tanstack/react-query';

export const characterKeys = {
  character: ['character'] as const,
  history: (externalId: string) =>
    [...characterKeys.character, 'history', externalId] as const,
};

export const useCharacterChatHistory = (
  character_external_id: string | null,
  options?: { staleTime?: number },
) => {
  const query = useQuery({
    queryKey: characterKeys.history(character_external_id ?? ''),
    queryFn: () =>
      neoAPI.fetchMergedHistories(character_external_id ?? '', true),
    staleTime: options?.staleTime != null ? options?.staleTime : Infinity,
    enabled: !!character_external_id,
  });

  return {
    ...query,
    isLoading: query.isLoading && !character_external_id,
    histories: query.data,
  };
};
