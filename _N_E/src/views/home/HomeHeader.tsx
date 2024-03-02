import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { UserLabel } from '@/components/Common/UserLabel';
import { MenuSearchbar } from '@/components/Search/Searchbar';
import { useAuth } from '@/context/AuthContext';
import { guideOpenSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { useSignalValue } from 'signals-react-safe';

export function HomeHeader() {
  const { user } = useAuth();
  return user ? <HomeHeaderSignedIn user={user} /> : <HomeHeaderSignedOut />;
}

export const HomeHeaderSignedIn = ({ user }: { user: Participant }) => {
  const guideOpen = useSignalValue(guideOpenSignal);

  return (
    <div
      className={cn('flex justify-end items-end md:justify-between pr-4', {
        'ml-6 lg:ml-0': !guideOpen,
      })}
    >
      <AnimationFadeInAndOut className="hidden md:flex flex-col gap-1">
        <p className="text-muted-foreground">{t('Home.welcome-back')}</p>
        <UserLabel user={user} />
      </AnimationFadeInAndOut>

      <div className="flex justify-end ml-6 gap-3">
        <MenuSearchbar />
      </div>
    </div>
  );
};

export const HomeHeaderSignedOut = () => (
  <div className="flex justify-end items-end pr-4 w-full">
    <MenuSearchbar />
  </div>
);
