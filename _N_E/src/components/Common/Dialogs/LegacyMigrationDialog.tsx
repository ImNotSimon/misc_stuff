import { logAnalyticsEvent } from '@/analytics/analytics';
import { Spinner } from '@/components/Common/Loader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { characterKeys } from '@/hooks/chat';
import {
  legacyMigrationDialogSignal,
  legacyMigrationIdSignal,
} from '@/lib/state/signals';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useQueryClient } from '@character-tech/client-common/src/hooks/queries/setup';
import { axios } from '@character-tech/client-common/src/lib/axios';
import { getApiURL } from '@character-tech/client-common/src/lib/axiosConstants';
import { DialogTitle } from '@radix-ui/react-dialog';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { useSignalValue } from 'signals-react-safe';

export interface Migration {
  migrationId: string;
  createTime: string;
  lastUpdateTime: string;
  status: string;
  properties: string;
}

enum RequestState {
  none = 'none',
  requested = 'requested',
  pending = 'pending',
  success = 'success',
}

let requestPollInterval: NodeJS.Timeout;
export function LegacyMigrationDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const open = useSignalValue(legacyMigrationDialogSignal);
  const legacyChatValue = useSignalValue(legacyMigrationIdSignal);

  const [error, setError] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.none,
  );

  // callbacks
  const loadMigratedHistory = useCallback(() => {
    if (legacyChatValue?.characterId && legacyChatValue?.historyId) {
      clearTimeout(requestPollInterval);
      void queryClient.invalidateQueries([
        characterKeys.history(legacyChatValue.characterId),
      ]);

      void router.push(
        AppPaths.chat(
          legacyChatValue?.characterId,
          `hist=${legacyChatValue?.historyId}`,
        ),
      );

      legacyMigrationIdSignal.value = null;
      legacyMigrationDialogSignal.value = false;
      setRequestState(RequestState.none);
      setError(false);
    }
  }, [
    legacyChatValue?.characterId,
    legacyChatValue?.historyId,
    queryClient,
    router,
  ]);

  const migrateChat = useCallback(() => {
    if (legacyChatValue) {
      logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
        referrer: 'ChatHistoryItem',
        characterId: legacyChatValue.characterId,
        chatId: legacyChatValue.historyId,
        action: 'legacy_migration_started',
      });

      setRequestState(RequestState.pending);
      axios()({
        url: `/migration/${legacyChatValue.historyId}`,
        baseURL: getApiURL(),
        method: 'post',
      })
        .catch(() => {
          setError(true);
        })
        .then(() => {
          setRequestState(RequestState.requested);
        })
        .catch(() => {
          setError(true);
        });
    }
  }, [legacyChatValue]);

  const pollMigrationStatus = useCallback(() => {
    axios()<{ migration?: Migration }>({
      url: `migration/${legacyChatValue?.historyId}`,
      baseURL: getApiURL(),
      method: 'get',
    })
      .then((response) => {
        if (response.data.migration?.status === 'STATUS_SUCCESS') {
          loadMigratedHistory();
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [legacyChatValue?.historyId, loadMigratedHistory]);

  // effects
  useEffect(() => {
    if (requestState === RequestState.requested && legacyChatValue?.historyId) {
      setRequestState(RequestState.pending);
      requestPollInterval = setInterval(() => {
        pollMigrationStatus();
      }, 5000);
      pollMigrationStatus();
    }

    if (requestState === RequestState.success && legacyChatValue?.characterId) {
      legacyMigrationDialogSignal.value = false;
      loadMigratedHistory();
    }

    if (error) {
      if (legacyChatValue?.characterId) {
        void queryClient.invalidateQueries([
          characterKeys.history(legacyChatValue.characterId),
        ]);
      }
      clearInterval(requestPollInterval);
    }
  }, [
    requestState,
    legacyChatValue,
    error,
    pollMigrationStatus,
    queryClient,
    loadMigratedHistory,
  ]);

  const renderContent = () => {
    if (error) {
      return <p>{t('Common.something-went-wrong-please-try-again-later')}</p>;
    }

    return (
      <>
        {requestState === RequestState.requested && (
          <div className="flex flex-col items-center gap-4">
            {t('legacy.this-shouldnt-take-long')}
            <Spinner />
          </div>
        )}
        {requestState === RequestState.pending && (
          <div className="flex flex-col items-center gap-4">
            {t('legacy.working-on-it')}
            <Spinner />
          </div>
        )}
        {requestState === RequestState.none && !!legacyChatValue && (
          <>
            <p>{t('legacy.looks-like-this-chat-is-a-bit-old')}</p>
            <p>
              {t(
                'legacy.in-order-to-continue-this-conversation-please-migrate-this-chat',
              )}
            </p>
            <Button onPress={migrateChat}>{t('legacy.migrate-chat')}</Button>
          </>
        )}
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        legacyMigrationDialogSignal.value = openValue;
        if (!openValue) {
          legacyMigrationIdSignal.value = null;
          setRequestState(RequestState.none);
          setError(false);
          clearInterval(requestPollInterval);
        }
      }}
    >
      <DialogContent className="bg-surface-elevation-2 border-none gap-6 flex-auto flex flex-col justify-between items-center max-w-dvw sm:max-w-xl w-full">
        <DialogTitle className="text-display">
          <FaHistory height="4em" width="4m" />
        </DialogTitle>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
