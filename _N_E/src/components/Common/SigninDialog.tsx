import { CaiLogo } from '@/components/Common/CaiLogo';
import SignInButtons from '@/components/Common/SigninButtons';
import { useGoogleOneTap } from '@/hooks/authHooks';
import { signinDialogSignal } from '@/lib/state/signals';
import { t } from 'i18next';
import { useSignalValue } from 'signals-react-safe';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

export function SignInDialog() {
  const open = useSignalValue(signinDialogSignal);
  useGoogleOneTap();

  // we need to handle our own custom overlay for this modal because we dont
  // want it to cover the google one tap login
  return (
    <>
      {!!open && <div className="fixed inset-0 z-50 bg-scrim w-full h-full" />}
      <Dialog
        modal={false}
        open={open}
        onOpenChange={(openValue) => {
          signinDialogSignal.value = openValue;
        }}
      >
        <DialogTrigger className="w-full" asChild />
        <DialogContent className="bg-surface-elevation-2 border-none px-12 gap-6 pb-12 flex-auto flex flex-col justify-between items-center">
          <CaiLogo />
          <p className="font-thin text-large text-wrap">
            {t('Common.create-an-account-or-sign-in')}
          </p>
          <SignInButtons />
        </DialogContent>
      </Dialog>
    </>
  );
}
