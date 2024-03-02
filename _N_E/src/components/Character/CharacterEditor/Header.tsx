import { Button } from '@/components/ui/button';
import { BookIcon, ChevronLeftSmIcon, LockIcon } from '@/components/ui/Icon';
import { guideOpenSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { ExternalLinks } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSignalValue } from 'signals-react-safe';

export const Header = ({ editingLocked }: { editingLocked: boolean }) => {
  const router = useRouter();

  const guideOpen = useSignalValue(guideOpenSignal);

  return (
    <div className="w-full flex flex-col gap-4 mb-4 items-center">
      <div
        className={cn('w-full flex justify-between', {
          'pl-6': guideOpen === 'closed',
        })}
      >
        <Button variant="ghost" onPress={() => router.back()} isIconOnly>
          <ChevronLeftSmIcon />
        </Button>
        <Button
          as={Link}
          variant="ghost"
          className="rounded-spacing-xs"
          href={ExternalLinks.characterBookCreateCharacter}
          target="_blank"
          startContent={
            <BookIcon
              height="16px"
              width="16px"
              className="text-muted-foreground"
            />
          }
          analyticsProps={{
            eventName: AnalyticsEvents.Links.Opened,
            properties: {
              link: ExternalLinks.characterBookCreateCharacter,
              referrer: 'CharacterEditor',
            },
          }}
        >
          {t('Common._comment-view-character-book')}
        </Button>
      </div>
      {!!editingLocked && (
        <div className="bg-transparency--4 p-3 rounded-spacing-xs sm:w-96 w-80 flex justify-between gap-3 items-center">
          <LockIcon height="32px" width="32px" />
          <p className="text-sm w-fit">{t('CharacterEditor.editing-locked')}</p>
        </div>
      )}
    </div>
  );
};
