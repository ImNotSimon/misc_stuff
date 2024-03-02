import { logAnalyticsEvent, logError } from '@/analytics/analytics';
import { api } from '@/utils/api';
import { isUserPlusMember } from '@/utils/userUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { neoAPI } from '@character-tech/client-common/src/chatManager/neoAPI';
import {
  useCreateDataAction,
  useDeactivateUser,
} from '@character-tech/client-common/src/hooks/queries/user';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { UserDataActionStatus } from '@character-tech/client-common/src/types/types';
import { t } from 'i18next';
import { del } from 'idb-keyval';
import { useCallback, useMemo, useState } from 'react';
import { DynamicDropdownMenu } from '../ui/DynamicDropdownMenu';
import { Button } from '../ui/button';
import { AppToast } from '../ui/use-toast';
import { ExportData } from './AccountOptionsButtons';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { ManageSubscription } from './ManageSubscription';

export const AccountOptions = ({ user }: { user: Participant }) => {
  const [alreadyShowedErrorToast, setAlreadyShowedErrorToast] = useState(false);

  const maybeShowError = useCallback(() => {
    if (!alreadyShowedErrorToast) {
      AppToast(t('Common.generic-error').toString(), undefined, 'destructive');
      setAlreadyShowedErrorToast(true);
    }
  }, [alreadyShowedErrorToast, setAlreadyShowedErrorToast]);

  /* LOGOUT */
  const logoutMutation = api.auth.logout.useMutation();

  const handleLogout = useCallback(async () => {
    logAnalyticsEvent(AnalyticsEvents.Auth.Logout, {
      referrer: 'AccountOptions',
    });
    await logoutMutation.mutateAsync();
    await del('REACT_QUERY_OFFLINE_CACHE');
    // delay 100 ms to allow the mutation to complete
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }, [logoutMutation]);

  /* DEACTIVATE */
  const { mutate: deactivateUser, isLoading: isLoadingDeactivate } =
    useDeactivateUser();

  const handleDeactivateUser = useCallback(() => {
    deactivateUser(undefined, {
      onSuccess: async () => {
        try {
          await neoAPI.deleteAccount();
        } catch (err) {
          console.error('Failed to delete user in NEO', { err });
        } finally {
          await handleLogout();
        }
      },
      onError: async (_error: unknown) => {
        maybeShowError();
      },
    });
  }, [deactivateUser, handleLogout, maybeShowError]);

  const { mutate: createDataAction, isLoading: isLoadingCreateDataAction } =
    useCreateDataAction();
  const isLoadingHandleDataAction = useMemo(
    () => isLoadingDeactivate || isLoadingCreateDataAction,
    [isLoadingDeactivate, isLoadingCreateDataAction],
  );

  const handleDataAction = useCallback(
    (action: 'export' | 'delete') => {
      createDataAction(
        {
          status: UserDataActionStatus.PENDING,
          actionParams: {
            dry_run: !!user.user?.is_staff,
            need_exported_data: action === 'export',
            need_deleted_account: action === 'delete',
          },
        },
        {
          onSuccess: () => {
            logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
              referrer: 'AccountOptions',
              type: 'data_actions',
              action,
            });
            if (action === 'delete') {
              AppToast(t('Common.success-request-initiated').toString());
              handleDeactivateUser();
            } else {
              AppToast(t('DeleteAccount.export-data-success').toString());
            }
          },
          onError: (error: unknown) => {
            logError('Failed to export/delete data', { error });
            maybeShowError();
          },
        },
      );
    },
    [
      createDataAction,
      handleDeactivateUser,
      maybeShowError,
      user.user?.is_staff,
    ],
  );

  /* DROPDOWN MENU */
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownOptions = [
    {
      content: (
        <ExportData
          handleExport={() => {
            handleDataAction('export');
            setDropdownOpen(false);
          }}
        />
      ),
      asChild: true,
      key: 'export',
    },
    {
      content: (
        <DeleteAccountDialog
          user={user}
          handleDeleteAccount={() => {
            handleDataAction('delete');
            setDropdownOpen(false);
          }}
          isLoadingDeleteAccount={isLoadingHandleDataAction}
        />
      ),
      asChild: true,
      key: 'delete',
    },
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <ManageSubscription isPlus={isUserPlusMember(user)} />
      <div className="flex justify-between gap-2">
        <Button
          isLoading={logoutMutation.isLoading}
          variant="ghost"
          onPress={handleLogout}
          className="text-muted-foreground"
        >
          {t('Common.logout')}
        </Button>
        <DynamicDropdownMenu
          options={dropdownOptions}
          setIsOpen={setDropdownOpen}
          isOpen={dropdownOpen}
          triggerClassName="opacity-100"
          side="top"
          contentClassName="border-accent"
        >
          <Button
            variant="ghost"
            color="secondary"
            className="bg-surface-elevation-3"
            onPress={() => {
              logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
                referrer: 'AccountOptions',
                action: 'manage_account_and_data',
              });
              setDropdownOpen(!dropdownOpen);
            }}
          >
            {t('DeleteAccount.manage-account-and-data')}
          </Button>
        </DynamicDropdownMenu>
      </div>
    </div>
  );
};
