import {
  setUseInfiniteQuery,
  setUseMutation,
  setUseQuery,
  setUseQueryClient,
} from '@character-tech/client-common/src/hooks/queries/setup';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

setUseMutation(useMutation);
setUseQuery(useQuery);
setUseQueryClient(useQueryClient);
setUseInfiniteQuery(useInfiniteQuery);
