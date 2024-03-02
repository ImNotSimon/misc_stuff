import { CaiLogo } from '@/components/Common/CaiLogo';
import { CheckFilledIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { plusSubscriptionDialogSignal } from '@/lib/state/signals';
import { CAIPLUS_PRICE, CUSTOMER_PORTAL_LINK } from '@/utils/constants';
import { motion } from 'framer-motion';
import { t } from 'i18next';
import { useSignalValue } from 'signals-react-safe';
import { RainbowGlow } from '../ui/RainbowGlow';
import { Dialog, DialogContent, DialogOverlay } from '../ui/dialog';

const upsellItems = [
  'Monetization.skip-the-waiting-rooms',
  'Monetization.faster-response-times',
  'Monetization.early-access-to-new-feature',
  'Monetization.cai-plus-community-access',
  'Monetization.profile-badge',
];

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
    },
  }),
};

export function PlusSubscriptionDialog() {
  const open = useSignalValue(plusSubscriptionDialogSignal);

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        plusSubscriptionDialogSignal.value = openValue;
      }}
    >
      <DialogOverlay className="backdrop-blur-none" />
      <DialogContent className="min-w-96 bg-background">
        <div className="flex flex-col gap-2">
          <CaiLogo isPlus />
          <div className="text-display font-thin">
            {t('Monetization.supercharge-your-experience')}
          </div>
          <div className="flex flex-col gap-3 my-4">
            {upsellItems.map((upsell, index) => (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={variants}
                className="flex gap-3"
                custom={index} // Pass index for staggered animation
                key={upsell}
              >
                <CheckFilledIcon height="1.5rem" />
                {t(upsell)}
              </motion.div>
            ))}
          </div>
        </div>
        <RainbowGlow
          custom={upsellItems.length} // Pass list length so this renders last
        >
          <a href={CUSTOMER_PORTAL_LINK} target="_blank">
            <Button className="w-full font-sans font-semibold">
              {t('Monetization.upgrade-for-some-price', {
                price: Number(CAIPLUS_PRICE).toLocaleString(),
              })}
            </Button>
          </a>
        </RainbowGlow>
        <Button
          onPress={() => {
            plusSubscriptionDialogSignal.value = false;
          }}
          variant="ghost"
        >
          {t('Common.cancel')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
