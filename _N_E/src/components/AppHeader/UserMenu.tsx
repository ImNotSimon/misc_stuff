/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import { logAnalyticsEvent } from '@/analytics/analytics';
import { CaiPlusBadge } from '@/components/Common/CaiPlusBadge';
import { GuideProfileIcon } from '@/components/Guide/GuideIcons';
import {
  LogoutIcon,
  ProfileCircleFilledIcon,
  SettingsIcon,
} from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { useAuth } from '@/context/AuthContext';
import { settingsDialogOpenSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { api } from '@/utils/api';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { del } from 'idb-keyval';
import Link from 'next/link';
import { useState } from 'react';
import { MdPerson } from 'react-icons/md';
import { HumanAvatar } from '../Profile/HumanAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function UserMenuCore({
  name,
  avatarFilename,
  username,
  isPlusUser,
  menuOpen,
  setMenuOpen,
  handleLogout,
  handleLogoutClick,
}: {
  name?: string;
  avatarFilename?: string;
  username?: string;
  isPlusUser: boolean;
  menuOpen: boolean;
  setMenuOpen: (val: boolean) => void;
  handleLogout: () => Promise<void>;
  handleLogoutClick: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
}) {
  const closeMenu = () => setMenuOpen(false);
  const sameUsername = username === name;

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger className="rounded-spacing-xs h-full w-full py-2 px-2 flex-start hover:bg-accent outline-none">
        <div className="flex w-full items-center gap-1 overflow-hidden">
          <div className="w-[36px] h-[36px] flex items-center justify-center">
            <HumanAvatar
              name={name || ''}
              size={36}
              src={avatarFilename}
              rounded
            />
          </div>
          <div className="text-sm flex flex-auto flex-col justify-center text-left ml-1 w-full">
            <div className="flex flex-row gap-1 items-center overflow-hidden w-full">
              <p className="line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal">
                {name}
              </p>
              {!!isPlusUser && <CaiPlusBadge className="text-sm p-1" />}
            </div>
            {!sameUsername && (
              <p
                className={cn(
                  'line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal text-sm',
                  {
                    'text-muted-foreground': !sameUsername,
                  },
                )}
              >
                @{username}
              </p>
            )}
          </div>
          <GuideProfileIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          className="cursor-pointer rounded-spacing-s"
          onClick={closeMenu}
        >
          <LinkWithAnalytics
            href={AppPaths.profile(username ?? '')}
            className="justify-between flex w-full px-4 py-2 text-md"
            analyticsProps={{
              eventName: AnalyticsEvents.UX.PageViewed,
              properties: {
                page_name: 'Profile',
                referrer: 'UserMenu',
              },
            }}
          >
            {t('User.profile')}
            <ProfileCircleFilledIcon height="1.5em" />
          </LinkWithAnalytics>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-spacing-s"
          onClick={closeMenu}
        >
          <div
            className="justify-between flex w-full px-4 py-2 text-md"
            onClick={() => {
              settingsDialogOpenSignal.value = true;
            }}
          >
            {t('Common.settings')}
            <SettingsIcon height="1.5em" />
          </div>
        </DropdownMenuItem>
        {/* needs to be <a> tag so that it will cause a full re-render */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <DropdownMenuItem
          className="cursor-pointer rounded-spacing-s"
          onClick={handleLogout}
        >
          <a
            href="#"
            className="justify-between flex w-full px-4 py-2 text-md"
            onClick={handleLogoutClick}
          >
            {t('Common.logout')}
            <LogoutIcon height="1.5em" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  const { user, isPlusUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const logoutMutation = api.auth.logout.useMutation();

  if (!user) {
    return (
      <Link href="/api/auth/login">
        <Button className="rounded-none" color="secondary">
          <MdPerson />
        </Button>
      </Link>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await del('REACT_QUERY_OFFLINE_CACHE');
    // delay 100 ms to allow the mutation to complete
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleLogoutClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();
    logAnalyticsEvent(AnalyticsEvents.Auth.Logout, { referrer: 'UserMenu' });
  };

  return (
    <UserMenuCore
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      name={user.name}
      avatarFilename={user.user?.account?.avatar_file_name}
      username={user.user?.username}
      isPlusUser={isPlusUser}
      handleLogout={handleLogout}
      handleLogoutClick={handleLogoutClick}
    />
  );
}
