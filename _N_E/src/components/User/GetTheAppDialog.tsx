import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppUtils } from '@/utils/appUtils';
import {
  APP_STORE_HREF,
  GOOGLE_PLAY_STORE_HREF,
} from '@character-tech/client-common/src/utils/constants';

import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { isAndroid, isMobile } from 'react-device-detect';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { Button } from '../ui/button';
import LinkWithAnalytics from '../ui/button/linkWithAnalytics';
import { SettingsButton } from './SettingsButton';

const MobileContent = ({ thisIsAndroid }: { thisIsAndroid: boolean }) => {
  const link = thisIsAndroid ? GOOGLE_PLAY_STORE_HREF : APP_STORE_HREF;

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Image src="/icon.svg" width="88" height="88" alt="c.ai" />
      <p className="text-center text-md text-muted-foreground">
        {thisIsAndroid
          ? t('GetTheApp.android-download-the-app')
          : t('GetTheApp.iphone-download-the-app')}
      </p>
      <LinkWithAnalytics
        href={link}
        target="_blank"
        analyticsProps={{
          eventName: AnalyticsEvents.Links.Opened,
          properties: {
            referrer: 'GetTheAppDialog',
            link,
          },
        }}
      >
        <Button startContent={thisIsAndroid ? <FaGooglePlay /> : <FaApple />}>
          {t('GetTheApp.get-app')}
        </Button>
      </LinkWithAnalytics>
    </div>
  );
};

const WebContent = () => (
  <div className="w-full flex flex-col gap-4 items-center">
    <div className="w-fit h-fit p-2 border-1 border-accent rounded-spacing-xs">
      <Image
        src={AppUtils.getStaticImageSource('get-app-qr-code')}
        alt={t('Settings.get-the-app')}
        width={88}
        height={88}
      />
    </div>
    <p className="text-center text-md text-muted-foreground">
      {t('GetTheApp.scan-the-qr-code')}
    </p>
  </div>
);

export const GetTheAppContent = ({
  thisIsMobile,
  thisIsAndroid,
}: {
  thisIsMobile: boolean;
  thisIsAndroid: boolean;
}) => {
  if (thisIsMobile) {
    return <MobileContent thisIsAndroid={thisIsAndroid} />;
  }
  return <WebContent />;
};

export const GetTheAppDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer: 'Settings', type: 'GetTheAppDialog' }}
    >
      <DialogTrigger asChild>
        <SettingsButton
          highlighted
          icon={<Image src="/icon.svg" width="24" height="24" alt="c.ai" />}
          onPress={() => setOpen(!open)}
        >
          {t('Settings.get-the-app')}
        </SettingsButton>
      </DialogTrigger>
      <DialogContent hideClose className="w-72 p-4">
        <div className="w-full flex items-center justify-between">
          <DialogClose>
            <X className="h-4 w-4" />
            <span className="sr-only">{t('Common.close')}</span>
          </DialogClose>
          <p>{t('Settings.get-the-app')}</p>
          <div className="h-4 w-4" />
        </div>
        <GetTheAppContent thisIsMobile={isMobile} thisIsAndroid={isAndroid} />
      </DialogContent>
    </Dialog>
  );
};
