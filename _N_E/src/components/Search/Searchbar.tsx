import { logAnalyticsEvent } from '@/analytics/analytics';
import { CharacterListItemCompact } from '@/components/Character/CharacterListItemCompact';
import { useSearchHook } from '@/components/Search/SearchHooks';
import { CloseIcon, SearchIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { Spinner } from '../Common/Loader';
import { Input } from '../ui/input';

export function MenuSearchbar({
  getCharacterHref,
  placeholder,
}: {
  getCharacterHref?: (characterId: string) => string;
  placeholder?: string;
}) {
  const generateCharacterHref = getCharacterHref || AppPaths.chat;
  const searchInputPlaceholder = placeholder || t('Search.placeholder');
  const {
    searchQuery,
    characterResults,
    isSearchLoading,
    clearSearch,
    onChangeSearchText,
    showSearchError,
    refetchSearch,
    submittedSearchQuery,
  } = useSearchHook(undefined, false, 'characters', 'Searchbar');
  const inputTextRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const iconSize = 16;

  const showResults = characterResults && submittedSearchQuery;
  return (
    <div>
      {!!showResults && (
        <div
          className="absolute left-0 top-0 z-30 h-screen w-screen bg-black opacity-30"
          onClick={clearSearch}
        />
      )}
      <div className="relative h-10 w-64 md:w-96">
        <div className="absolute z-40 flex w-full max-w-3xl border-spacing-1 flex-row self-center items-center rounded-full border-cardAlt bg-surface-elevation-2 p-2 placeholder:text-muted-foreground">
          <Button
            variant="ghost"
            isIconOnly
            className="ml-2"
            onPress={() => {
              inputTextRef.current?.focus();
            }}
          >
            {isSearchLoading ? (
              <Spinner size={iconSize} />
            ) : (
              <SearchIcon height="1.5em" />
            )}
          </Button>
          <Input
            className="rounded-full rounded-l-none border-none bg-transparent placeholder:text-muted-foreground py-2"
            type="text"
            ref={inputTextRef}
            placeholder={searchInputPlaceholder}
            onChange={(evt) => onChangeSearchText(evt.target.value)}
            value={searchQuery}
            onKeyDown={(evt) => {
              // TODO: switch this to a form and properly capture the input
              if (evt.key === 'Enter') {
                void router.push(AppPaths.search(searchQuery));
                logAnalyticsEvent(AnalyticsEvents.Search, {
                  referrer: 'Searchbar',
                  query: searchQuery,
                });
              }
            }}
          />
          {!!searchQuery && (
            <Button
              variant="ghost"
              isIconOnly
              className="bg-background mr-4"
              onPress={clearSearch}
            >
              <CloseIcon height="1em" />
            </Button>
          )}
        </div>
      </div>
      {!!showSearchError && (
        <div className="flex max-w-3xl justify-center self-center sm:px-12 ">
          <div className="absolute z-40 mt-2 flex max-h-[calc(100vh-8rem)] w-96 flex-col overflow-y-scroll rounded-md bg-card px-2">
            <p className="m-4 text-center">
              {t('Search.something-went-wrong-loading-search-results')}
            </p>
            <Button
              className="my-4 w-48 self-center"
              onPress={() => {
                logAnalyticsEvent(AnalyticsEvents.Search, {
                  referrer: 'Searchbar',
                  action: 'retry',
                });
                void refetchSearch();
              }}
              color="secondary"
            >
              {t('Common.try-again')}
            </Button>
          </div>
        </div>
      )}
      {!!showResults && (
        <div className="flex max-w-3xl justify-end md:justify-center self-center py-3">
          <div className="absolute z-50 mt-2 max-h-[calc(100vh-8rem)] max-w-[90dvw] sm:w-96 overflow-y-scroll rounded-spacing-l bg-surface-elevation-2 px-2 gap-1 flex flex-col">
            {!!characterResults &&
              characterResults.length > 0 &&
              characterResults.map((c) => (
                <CharacterListItemCompact
                  referrer="Searchbar"
                  key={c.external_id}
                  src={c.avatar_file_name}
                  href={generateCharacterHref(c.external_id)}
                  name={c.participant__name}
                  title={c.title ? c.title : c.greeting}
                  author={c.user__username}
                  interactions={c.participant__num_interactions}
                  upvotes={c.upvotes}
                />
              ))}
            {characterResults?.length === 0 && (
              <div className="p-4">{t('Search.no-results')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
