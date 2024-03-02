import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import { logAnalyticsEvent } from '@/analytics/analytics';
import { Separator } from '@/components/ui/separator';
import { AppToast } from '@/components/ui/use-toast';
import i18n, { getDateFnsLocale } from '@/i18n/config';
import {
  legacyMigrationDialogSignal,
  legacyMigrationIdSignal,
} from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import type { CharacterHistoryShunt } from '@character-tech/client-common/src/types/app-api';
import { formatDistance } from 'date-fns';
import { useRouter } from 'next/router';

export function ChatHistoryItem({
  history,
  characterId,
}: {
  history: CharacterHistoryShunt;
  characterId: string;
}) {
  const router = useRouter();
  const formatDate = (dateString: string) =>
    `${formatDistance(new Date(dateString), new Date(), {
      addSuffix: false,
      locale: getDateFnsLocale(),
    })} ago`;

  // eslint-disable-next-line no-nested-ternary
  const lastDate = history.last_interaction
    ? formatDate(history.last_interaction)
    : history.create_time
      ? formatDate(history.create_time)
      : null;

  const previewTurn = history.preview_turns?.[0];
  const previewText = previewTurn?.candidates?.length
    ? previewTurn.candidates[0]?.raw_content ?? ''
    : '';

  const canMigrateLegacyChats =
    AmplitudeExperimentationFactory.checkAmplitudeVariantValue(
      AmplitudeVariants.MigrateLegacyChats,
      'treatment',
    );

  if (!previewText) {
    return null;
  }

  const onClick = () => {
    if (history.isNeo) {
      logAnalyticsEvent(AnalyticsEvents.UX.CharacterSelected, {
        referrer: 'ChatHistoryItem',
        characterId,
        chatId: history.chat_id,
      });
      void router.push(AppPaths.chat(characterId, `hist=${history.chat_id}`));
    } else if (history.chat_id && characterId && canMigrateLegacyChats) {
      legacyMigrationIdSignal.value = {
        historyId: history.chat_id,
        characterId,
      };
      legacyMigrationDialogSignal.value = true;
      logAnalyticsEvent(AnalyticsEvents.UX.CharacterSelected, {
        referrer: 'ChatHistoryItem',
        characterId,
        chatId: history.chat_id,
        action: 'legacy_clicked',
      });
    } else {
      AppToast('Legacy chat currently unavailable', undefined, 'destructive');
    }
  };

  return (
    <div
      onClick={onClick}
      className="hover:bg-surface-elevation-1 cursor-pointer p-2 rounded-spacing-xs"
    >
      <div className="items-start justify-start text-left gap-2 flex flex-col max-h-32 overflow-hidden text-ellipsis ">
        <div className="flex gap-2 items-center">
          <p className="font-light text-base">{lastDate}</p>
          {!history.isNeo && (
            <p className="text-center text-sm p-1 rounded-spacing-xs bg-secondary font-light">
              {i18n.t('Common.legacy')}
            </p>
          )}
        </div>
        <p
          className={cn('text-muted-foreground font-light', {
            'opacity-50': !history.isNeo,
          })}
        >
          {previewText}
        </p>
      </div>
      <Separator className="mt-2" />
    </div>
  );
}
