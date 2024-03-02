/* eslint-disable @typescript-eslint/no-empty-function */
import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { CaiLogo } from '@/components/Common/CaiLogo';
import { GuideContent } from '@/components/Guide/GuideContent';
import {
  GuideCollapseIcon,
  GuideExpandIcon,
} from '@/components/Guide/GuideIcons';
import { Button } from '@/components/ui/button';
import { useIsLargeScreen, useIsSmallScreen } from '@/hooks/displayHooks';
import { guideOpenSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSignalValue } from 'signals-react-safe';

export function Guide() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const isLargeViewport = useIsLargeScreen();
  const isMobile = useIsSmallScreen();
  // this is used to track if the mobile guide is open and the animation to open it has finished
  const mobileGuideOpen = useRef(false);

  useEffect(() => {
    if (isLargeViewport) {
      guideOpenSignal.value = 'open';
    }

    setIsFirstRender(false);
  }, [isLargeViewport]);

  const guideOpen = useSignalValue(guideOpenSignal);

  const isOpen = useMemo(() => guideOpen !== 'closed', [guideOpen]);

  const closeGuide = () => {
    guideOpenSignal.value = 'closed';
    mobileGuideOpen.current = false;
  };

  const toggleGuide = useCallback(() => {
    const openValue = isMobile ? 'mobile' : 'open';
    guideOpenSignal.value = guideOpen === openValue ? 'closed' : openValue;
    if (!guideOpenSignal.value) {
      mobileGuideOpen.current = false;
    }
  }, [guideOpen, isMobile]);

  const renderIcon = () => {
    if (isOpen) {
      return <GuideCollapseIcon className="h-full" />;
    }

    return <GuideExpandIcon className="h-full" />;
  };

  return (
    <div className={cn('w-full h-full flex', isMobile ? 'mr-0' : 'mr-7')}>
      {!!isMobile && !!isOpen && (
        <AnimatePresence>
          <div className="absolute left-0 top-0 z-50 flex h-screen w-screen">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationComplete={() => {
                mobileGuideOpen.current = true;
              }}
              exit={{ opacity: 0 }}
              className="absolute z-0 left-0 top-0 h-full w-full flex-auto bg-scrim"
              onClick={() => {
                if (mobileGuideOpen.current) {
                  closeGuide();
                }
              }}
            />
            <motion.div
              initial={{ left: '-16rem' }}
              animate={{ left: '0' }}
              exit={{ left: '-16rem' }}
              className="absolute z-50 top-0 h-full w-64 border-r border-r-accent bg-primary-foreground"
            >
              <div className="h-full">
                <GuideContent onCollapse={closeGuide} />
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
      {!isMobile && (
        <div
          className={cn(
            'overflow-hidden transition-all ease-out duration-300',
            {
              'max-w-64 translate-x-0': isOpen && !isFirstRender,
              'max-w-0 -translate-x-full': !isOpen && !isFirstRender,
            },
          )}
        >
          <GuideContent onCollapse={closeGuide} />
        </div>
      )}

      <AnimationFadeInAndOut
        className={cn('m-5 ml-0 flex items-center absolute z-50', {
          hidden: isOpen,
        })}
      >
        <Button variant="ghost" onPress={toggleGuide}>
          <CaiLogo mini />
          {renderIcon()}
        </Button>
      </AnimationFadeInAndOut>
      <div className="mx-2 hidden sm:visible" />
    </div>
  );
}
