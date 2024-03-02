import { logAnalyticsEvent } from '@/analytics/analytics';
import { api } from '@/utils/api';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useSearchVoices } from '@character-tech/client-common/src/hooks/queries/voices';
import {
  type Character,
  type SearchedUser,
} from '@character-tech/client-common/src/types/app-api';
import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';

const useSearchSelectorHook = (
  submittedSearchQuery: string,
  searchType: 'creators' | 'characters' = 'characters',
): {
  characterResults: Character[] | undefined;
  creatorResults: SearchedUser[] | undefined;
  isLoading: boolean;
  isSearchError: boolean;
  refetchSearch: () => void;
  error: unknown;
} => {
  const {
    data: characterResults,
    isLoading,
    error: searchError,
    isError: isSearchError,
    refetch: refetchSearch,
  } = api.search.search.useQuery(
    {
      searchQuery: submittedSearchQuery,
    },
    {
      enabled: searchType === 'characters' && !!submittedSearchQuery,
    },
  );

  const {
    data: creatorResults,
    isLoading: creatorIsLoading,
    isError: isCreatorSearchError,
    refetch: refetchCreatorSearch,
    error: creatorError,
  } = api.search.searchCreators.useQuery(
    {
      searchQuery: submittedSearchQuery,
    },
    {
      enabled: searchType === 'creators' && !!submittedSearchQuery,
    },
  );

  if (searchType === 'creators') {
    return {
      characterResults: [],
      creatorResults,
      error: creatorError,
      isLoading: creatorIsLoading,
      isSearchError: isCreatorSearchError,
      refetchSearch: refetchCreatorSearch,
    };
  }

  return {
    characterResults,
    creatorResults: [],
    isLoading,
    error: searchError,
    isSearchError,
    refetchSearch,
  };
};

export const useSearchHook = (
  initialQuery = '',
  disablePreviews = false,
  searchType: 'creators' | 'characters' = 'characters',
  referrer = 'search_hook',
) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedSearchQuery, setSubmittedSearchQuery] =
    useState(initialQuery);

  // debounced search suggestions using search API
  const [suggestedSearchQuery, setSuggestedSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(suggestedSearchQuery, 1000);

  useEffect(() => {
    if (submittedSearchQuery) {
      logAnalyticsEvent(AnalyticsEvents.Search, {
        referrer,
        type: searchType,
        query: submittedSearchQuery,
      });
    }
  }, [referrer, searchType, submittedSearchQuery]);

  useEffect(() => {
    if (!disablePreviews) {
      setSubmittedSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, disablePreviews]);

  const {
    characterResults,
    creatorResults,
    isLoading,
    isSearchError,
    refetchSearch,
    error,
  } = useSearchSelectorHook(submittedSearchQuery, searchType);

  const clearSearchQueries = () => {
    setSubmittedSearchQuery('');
    setSuggestedSearchQuery('');
  };

  const onChangeSearchText = (query: string) => {
    if (!query && !disablePreviews) {
      clearSearchQueries();
    } else {
      // set suggested search to hit the search API
      setSuggestedSearchQuery(query);
    }
    setSearchQuery(query);
  };

  const clearSearch = () => {
    onChangeSearchText('');
  };

  const isSearchLoading =
    isLoading &&
    (submittedSearchQuery.length > 0 ||
      (suggestedSearchQuery.length > 0 && !disablePreviews));

  const showSearchError = !isSearchLoading && isSearchError;

  return {
    clearSearch,
    onChangeSearchText,
    searchQuery,
    showSearchError,
    characterResults,
    creatorResults,
    isSearchLoading,
    submittedSearchQuery,
    error,
    refetchSearch,
    setSubmittedSearchQuery,
  };
};

export const useVoiceSearchHook = (
  initialQuery = '',
  disablePreviews = false,
  referrer = 'search_hook',
) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedSearchQuery, setSubmittedSearchQuery] =
    useState(initialQuery);

  // debounced search suggestions using search API
  const [suggestedSearchQuery, setSuggestedSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(suggestedSearchQuery, 1000);

  useEffect(() => {
    if (submittedSearchQuery) {
      logAnalyticsEvent(AnalyticsEvents.Search, {
        referrer,
        type: 'voice',
        query: submittedSearchQuery,
      });
    }
  }, [referrer, submittedSearchQuery]);

  useEffect(() => {
    if (!disablePreviews) {
      setSubmittedSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, disablePreviews]);

  const {
    searchResults,
    isLoading,
    isError,
    refetch: refetchSearch,
    error,
  } = useSearchVoices(submittedSearchQuery);

  const clearSearchQueries = () => {
    setSubmittedSearchQuery('');
    setSuggestedSearchQuery('');
  };

  const onChangeSearchText = (query: string) => {
    if (!query && !disablePreviews) {
      clearSearchQueries();
    } else {
      // set suggested search to hit the search API
      setSuggestedSearchQuery(query);
    }
    setSearchQuery(query);
  };

  const clearSearch = () => {
    onChangeSearchText('');
  };

  const isSearchLoading =
    isLoading &&
    (submittedSearchQuery.length > 0 ||
      (suggestedSearchQuery.length > 0 && !disablePreviews));

  const showSearchError = !isSearchLoading && isError;

  return {
    clearSearch,
    onChangeSearchText,
    searchQuery,
    showSearchError,
    searchResults,
    isSearchLoading,
    submittedSearchQuery,
    error,
    refetchSearch,
    setSubmittedSearchQuery,
  };
};
