import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { motion } from 'framer-motion';
import { t } from 'i18next';
import NextImage from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { IoRefreshSharp } from 'react-icons/io5';
import { MdImageNotSupported } from 'react-icons/md';

// handles loading and retrying of images
// retrying is required since TTI service serves dead links sometimes while generating images
export function ChatImage({
  src,
  retryCount = 10,
  style,
  className,
}: {
  src: string;
  retryCount: number;
  style?: CSSProperties;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hasError, setHasError] = useState(false);

  const initialBackoffMS = 1000;
  const backoffIncrementMS = 250;

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      // if we haven't exceeded the retry count, try again
      if (attempts < retryCount) {
        // incremental backoff
        const backoffMS = initialBackoffMS + attempts * backoffIncrementMS;
        setTimeout(() => setAttempts(attempts + 1), backoffMS);
      } else {
        setHasError(true);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [attempts, src, retryCount]);

  // note there may be a race condition between this effect and the one above
  useEffect(() => {
    // reset state when src changes
    setAttempts(0);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-md text-center align-middle ${className}`}
        style={{ width: 200, height: 200, ...style }}
      >
        <MdImageNotSupported size={64} className="fill-error" />
        <p className="p-4 text-sm">
          {t('Chat.Image.something-went-wrong-making-this-image')}
        </p>
      </div>
    );
  }

  // show loading animation if we haven't loaded yet
  if (!isLoaded) {
    return (
      <AnimationFadeInAndOut>
        <div
          style={{ width: 200, height: 200, ...style }}
          className={`flex flex-col items-center justify-center rounded-md bg-accent text-center align-middle ${className}`}
        >
          <motion.div
            style={{ transformOrigin: '50% 57%' }}
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            <IoRefreshSharp size={32} />
          </motion.div>
          <p className="p-4 text-sm">{t('Chat.Image.creating-image')}</p>
        </div>
      </AnimationFadeInAndOut>
    );
  }

  return (
    <AnimationFadeInAndOut>
      <NextImage
        style={{ ...style }}
        src={src}
        alt="Loaded content"
        className={`rounded-md ${className}`}
        width={200}
        height={200}
      />
    </AnimationFadeInAndOut>
  );
}
