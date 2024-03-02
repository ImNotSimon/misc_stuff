import { VoiceIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { AppUtils } from '@/utils/appUtils';
import { motion, type AnimationControls, type Variants } from 'framer-motion';
import Image from 'next/image';
import { type HomeAssetFilename } from './types';

export const AnimatedDiv = ({
  controls,
  variants,
  children,
  className,
}: {
  controls: AnimationControls;
  variants: Variants;
  children: React.ReactElement;
  className?: string;
}) => (
  <motion.div
    className={cn('absolute', className)}
    initial="hidden"
    animate={controls}
    variants={variants}
  >
    {children}
  </motion.div>
);

export const AnimatedSmallCircleImage = ({
  alt,
  controls,
  variants,
}: {
  alt: HomeAssetFilename;
  controls: AnimationControls;
  variants: Variants;
}) => (
  <AnimatedDiv controls={controls} variants={variants}>
    <Image
      className="rounded-full"
      src={AppUtils.getHomeAssetImageSource(alt)}
      alt={alt}
      width={15}
      height={15}
    />
  </AnimatedDiv>
);

export const AnimatedVoiceIcon = ({
  controls,
  variants,
  className,
}: {
  controls: AnimationControls;
  variants: Variants;
  className?: string;
}) => (
  <AnimatedDiv controls={controls} variants={variants}>
    <VoiceIcon height="32px" width="32px" className={className} />
  </AnimatedDiv>
);

export const AnimatedText = ({
  text,
  controls,
  variants,
  className,
}: {
  text: string;
  controls: AnimationControls;
  variants: Variants;
  className?: string;
}) => (
  <AnimatedDiv controls={controls} variants={variants}>
    <div
      className={cn(
        'bg-surface-elevation-3 px-3 py-1 w-fit rounded-full',
        className,
      )}
    >
      {text}
    </div>
  </AnimatedDiv>
);
