'use client';

import { logError } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import { BackIcon } from '../ui/Icon';

const ErrorActionButton = ({
  refresh,
  isTransient,
}: {
  refresh: () => void;
  isTransient?: boolean;
}) => {
  const router = useRouter();

  if (!isTransient) {
    return (
      <Button color="secondary" onPress={refresh}>
        {t('Common.retry')}
      </Button>
    );
  }
  return (
    <Button color="secondary" onPress={() => router.back()}>
      <BackIcon /> {t('Common.back')}
    </Button>
  );
};

export function ErrorView({
  refresh,
  text,
  isTransient,
}: {
  refresh: () => void;
  text?: string;
  isTransient?: boolean;
}) {
  logError('An error has occurred', {
    error: {
      referrer: 'ErrorView',
      text,
      isTransient,
    },
  });
  return (
    <div className="flex h-full w-full flex-col p-4 items-center">
      <div className="m-4 text-center">
        {text ?? t('Error.something-went-wrong')}
      </div>
      <ErrorActionButton isTransient={isTransient ?? false} refresh={refresh} />
    </div>
  );
}
