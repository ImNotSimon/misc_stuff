import { Spinner } from '@/components/Common/Loader';
import { useVoiceSearchHook } from '@/components/Search/SearchHooks';
import { CenteredBox } from '@/components/ui/CenteredBox';
import { CloseIcon, SearchIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useCharacter } from '@/context/CharacterContext';
import { useVoiceContext } from '@/context/VoiceContext';
import { playAudioFile, stopAudio } from '@/lib/voice/mediaConnection';
import {
  useFeaturedVoices,
  useGetVoice,
  useSearchVoices,
  useUserVoices,
} from '@character-tech/client-common/src/hooks/queries/voices';
import { type Voice } from '@character-tech/client-common/src/types/app-api';
import {
  deduplicateVoices,
  isUserCreatedVoice,
} from '@character-tech/client-common/src/voice/voiceUtils';
import { t } from 'i18next';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { FaLock, FaPlay, FaStop } from 'react-icons/fa';

export interface ChatVoiceSelectionProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChatVoiceSelectionView({
  isOpen,
  onOpenChange,
}: ChatVoiceSelectionProps) {
  const { overrideVoice, getCharacterVoiceId } = useVoiceContext();

  const selectedVoiceId = getCharacterVoiceId();
  const selectVoice = (voiceId: string) => {
    if (voiceId === selectedVoiceId) {
      overrideVoice(undefined);
    } else {
      overrideVoice(voiceId);
    }

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <VoiceSelectionView
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectVoice={selectVoice}
      selectedVoiceId={selectedVoiceId}
    />
  );
}

interface VoiceSelectionProps extends ChatVoiceSelectionProps {
  selectVoice: (voiceId: string) => void;
  selectedVoiceId?: string | null;
  renderTrigger?: () => JSX.Element;
}
export function VoiceSelectionView({
  isOpen,
  onOpenChange,
  selectVoice,
  selectedVoiceId,
  renderTrigger,
}: VoiceSelectionProps) {
  const discoverTab = 'discover';
  const yourVoicesTab = 'your-voices';
  const {
    searchQuery,
    searchResults,
    isSearchLoading,
    clearSearch,
    onChangeSearchText,
  } = useVoiceSearchHook(undefined, false, 'ChatVoiceSelectionView');
  const { character } = useCharacter();

  const { searchResults: implicitSearchResults } = useSearchVoices(
    character?.name.slice(0, 1) ?? '',
  );
  const { voices: systemVoices } = useFeaturedVoices();
  const { voices: userVoices } = useUserVoices();

  const { voice: defaultCharacterVoice } = useGetVoice(
    character?.default_voice_id,
    true,
  );
  const { voice: currentlySelectedVoice } = useGetVoice(selectedVoiceId, true);
  const { user } = useAuth();

  const [tab, setTab] = useState<'discover' | 'your-voices'>(discoverTab);

  const filteredResults = useMemo(() => {
    if (searchQuery) {
      const publicResults = searchResults ?? [];

      const privateResults =
        userVoices?.filter(
          (v) =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description
              .toLowerCase()
              .includes(searchQuery.toLocaleLowerCase()),
        ) ?? [];
      return [...publicResults, ...privateResults];
    }

    const isNotSelectedOrDefault = (v: Voice) =>
      v.id !== currentlySelectedVoice?.id && v.id !== defaultCharacterVoice?.id;

    const voices = tab === yourVoicesTab ? userVoices : systemVoices;
    let results = (voices ?? []).filter(isNotSelectedOrDefault);

    const addVoiceIfValid = (voice: Voice | undefined) => {
      if (
        voice &&
        isUserCreatedVoice(voice, user) === (tab === yourVoicesTab) &&
        !results.some((v) => v.id === voice.id)
      ) {
        results.unshift(voice);
      }
    };

    addVoiceIfValid(currentlySelectedVoice);
    addVoiceIfValid(defaultCharacterVoice);

    if (tab === discoverTab && implicitSearchResults) {
      results = results.concat(
        implicitSearchResults.filter((v) => !isUserCreatedVoice(v, user)),
      );
    }

    return deduplicateVoices(results);
  }, [
    tab,
    user,
    currentlySelectedVoice,
    defaultCharacterVoice,
    implicitSearchResults,
    searchQuery,
    searchResults,
    systemVoices,
    userVoices,
  ]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      analyticsProps={{ referrer: 'ChatVoice', type: 'ChatVoiceSelection' }}
    >
      {renderTrigger?.()}
      <DialogContent className="p-0 cursor-default w-full max-w-lg">
        <DialogHeader className="px-5 pt-7">
          <DialogTitle>{t('Voice.voices')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Tabs
            value={tab}
            tabIndex={-1}
            onValueChange={(newTab) => setTab(newTab as typeof tab)}
          >
            <TabsList className="px-4">
              <TabsTrigger value={discoverTab}>
                {t('Voice.discover')}
              </TabsTrigger>
              <TabsTrigger value={yourVoicesTab}>
                {t('Voice.your-voices')}
              </TabsTrigger>
            </TabsList>
            <div className="w-full h-[368px] flex flex-col">
              {tab === discoverTab && (
                <VoiceSearchBar
                  onChange={(evt) => onChangeSearchText(evt.target.value)}
                  searchQuery={searchQuery}
                  isSearchLoading={isSearchLoading}
                  iconSize={16}
                  clearSearch={clearSearch}
                />
              )}
              <div className="h-full overflow-y-auto">
                {filteredResults.length > 0 && (
                  <VoiceList
                    onSelect={selectVoice}
                    selectedVoiceId={currentlySelectedVoice?.id}
                    defaultCharacterVoiceId={defaultCharacterVoice?.id}
                    voices={filteredResults}
                  />
                )}
              </div>
            </div>
          </Tabs>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

interface VoiceListProps {
  onSelect: (voiceId: string) => void;
  selectedVoiceId?: string;
  voices: Voice[];
  isLoading?: boolean;
  defaultCharacterVoiceId?: string;
}

function VoiceList({
  onSelect,
  selectedVoiceId,
  voices,
  isLoading,
  defaultCharacterVoiceId,
}: VoiceListProps) {
  const [samplePlayingId, setSamplePlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (samplePlayingId == null) {
      stopAudio();
      return;
    }
    const currVoice = voices.find((voice) => voice.id === samplePlayingId);
    if (currVoice == null) {
      return;
    }

    const resetSampleId = () => setSamplePlayingId(null);
    const cleanUp = playAudioFile(currVoice.previewAudioURI, resetSampleId);
    return cleanUp;
  }, [voices, samplePlayingId]);

  if (isLoading) {
    return (
      <CenteredBox className="h-20">
        <Spinner size={16} />
      </CenteredBox>
    );
  }

  if (voices.length === 0) {
    return <CenteredBox className="h-20">{t('Voice.no-voices')}</CenteredBox>;
  }

  return (
    <div className="gap-3 flex flex-col h-full my-2">
      {voices.map(({ id, name, description, visibility }) => {
        const isPlayingSample = samplePlayingId === id;
        const isPrivateVoice = visibility === 'private';
        return (
          <SampleRow
            key={id}
            name={name}
            description={description}
            isPlaying={isPlayingSample}
            isPrivate={isPrivateVoice}
            onClickPreviewPlaybackButton={() =>
              setSamplePlayingId(isPlayingSample ? null : id)
            }
            onClickSelectButton={() => onSelect(id)}
            isSelected={selectedVoiceId === id}
            isDefaultVoice={defaultCharacterVoiceId === id}
          />
        );
      })}
    </div>
  );
}

interface PreviewPlaybackProps {
  isPlaying?: boolean;
}

interface SampleRowProps extends PreviewPlaybackProps {
  isPrivate: boolean;
  name: string;
  description: string;
  onClickPreviewPlaybackButton: () => void;
  onClickSelectButton: () => void;
  isSelected?: boolean;
  isDefaultVoice?: boolean;
}

function SampleRow({
  isPlaying,
  isPrivate,
  onClickPreviewPlaybackButton,
  onClickSelectButton,
  name,
  description,
  isSelected,
  isDefaultVoice,
}: SampleRowProps) {
  return (
    <div className="px-4 py-2 group gap-3 flex flex-row items-center hover:bg-white/[.04]">
      <div>
        <PreviewPlaybackButton
          isPlaying={isPlaying}
          onClick={onClickPreviewPlaybackButton}
        />
      </div>
      <div className="grow">
        <div className="text-card-foreground text-md flex items-center gap-1">
          {name} {!!isPrivate && <FaLock size={8} className="opacity-20" />}
        </div>

        <div className="text-md text-muted-foreground">{description}</div>
        {!!isDefaultVoice && (
          <div className="text-md text-blue">{t('Voice.default')}</div>
        )}
        {!!isSelected && !isDefaultVoice && (
          <div className="text-md text-blue">{t('Voice.selected')}</div>
        )}
      </div>
      <Button
        onPress={onClickSelectButton}
        className="hidden group-hover:block"
        variant={isSelected ? 'outline' : 'primary'}
      >
        {isSelected ? t('Common.unselect') : t('Common.select')}
      </Button>
    </div>
  );
}

interface PreviewPlaybackButtonProps extends PreviewPlaybackProps {
  onClick: () => void;
}

function PreviewPlaybackButton({
  isPlaying,
  onClick,
}: PreviewPlaybackButtonProps) {
  return (
    <button
      aria-label={t('Voice.play-sample')}
      type="button"
      className="flex justify-center items-center size-12 bg-card rounded-spacing-xs text-card-foreground cursor-pointer"
      onClick={onClick}
    >
      {isPlaying ? <FaStop size={16} /> : <FaPlay size={16} />}
    </button>
  );
}

interface VoiceSearchBarProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
  isSearchLoading: boolean;
  iconSize: number;
  clearSearch: () => void;
}

export function VoiceSearchBar({
  onChange,
  searchQuery,
  isSearchLoading,
  iconSize,
  clearSearch,
}: VoiceSearchBarProps) {
  const inputTextRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-fit z-40 flex w-full max-w-3xl border-spacing-1 flex-row self-center items-center rounded-none border-cardAlt bg-surface-elevation-2 p-2 placeholder:text-placeholder">
      <Button
        variant="ghost"
        isIconOnly
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
        className="rounded-none border-none bg-transparent placeholder:text-placeholder"
        type="text"
        ref={inputTextRef}
        placeholder={t('Voice.search-label')}
        onChange={onChange}
        value={searchQuery}
        label=""
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
  );
}
