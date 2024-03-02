import { AppUtils } from '@/utils/appUtils';
import {
  AnimatedDiv,
  AnimatedSmallCircleImage,
  AnimatedText,
  AnimatedVoiceIcon,
} from '@/views/home/createCharacterGraphic/BaseComponents';
import {
  type Position,
  type VariantProps,
} from '@/views/home/createCharacterGraphic/types';
import { useAnimation, useInView, type Variants } from 'framer-motion';
import { t } from 'i18next';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

const createVariants = (
  finalPos: Position,
  initialPos?: Position,
  scaleProps?: VariantProps,
  opacityProps?: VariantProps,
) =>
  ({
    hidden: {
      scale: scaleProps?.hidden ?? 0.2,
      opacity: opacityProps?.hidden ?? 0,
      ...(initialPos ?? { top: 162, left: 300 }),
    },
    visible: {
      scale: scaleProps?.visible ?? 1,
      opacity: opacityProps?.visible ?? 1,
      transition: {
        ease: 'easeInOut',
        duration: Math.random() * 0.75 + 0.15,
      },
      ...finalPos,
    },
  }) as Variants;

export const CreateCharacterGraphic = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      void controls.start('visible');
    } else {
      void controls.start('hidden');
    }
  }, [controls, inView]);

  if (isMobile) {
    return null;
  }
  return (
    <div className="w-full flex justify-center" ref={ref}>
      <div className="w-[600px] h-[250px] relative">
        {/* left side of 3 main characters from top to bottom */}
        <AnimatedSmallCircleImage
          controls={controls}
          variants={createVariants({ top: 80, left: 150 })}
          alt="zeus"
        />
        <AnimatedVoiceIcon
          controls={controls}
          className="text-accent"
          variants={createVariants({ top: 90, left: 50 })}
        />
        <AnimatedSmallCircleImage
          controls={controls}
          alt="noblewoman"
          variants={createVariants({ top: 140, left: 110 })}
        />
        <AnimatedSmallCircleImage
          controls={controls}
          variants={createVariants(
            { top: 180, left: 20 },
            undefined,
            undefined,
            { hidden: 0.2, visible: 0.5 },
          )}
          alt="einstein"
        />
        <AnimatedText
          text={t('Home.witty')}
          controls={controls}
          variants={createVariants({ top: 200, left: 90 })}
        />
        {/* 3 main characters */}
        <div className="flex flex-row items-center">
          <AnimatedDiv
            controls={controls}
            variants={createVariants(
              { top: 125, left: 184 },
              { top: 125, left: 300 },
              { hidden: 0, visible: 1 },
            )}
          >
            <Image
              className="opacity-50 rounded-spacing-s"
              src={AppUtils.getHomeAssetImageSource('philosopher')}
              alt="philosopher"
              width={75}
              height={75}
            />
          </AnimatedDiv>
          <AnimatedDiv
            className="z-10"
            controls={controls}
            variants={createVariants(
              {
                top: 100,
                left: 240,
              },
              {
                top: 100,
                left: 240,
                x: 0,
                y: 0,
              },
              { hidden: 0, visible: 1 },
              { hidden: 1, visible: 1 },
            )}
          >
            <Image
              className="rounded-spacing-s"
              src={AppUtils.getHomeAssetImageSource('zeus')}
              alt="zeus"
              width={125}
              height={125}
            />
          </AnimatedDiv>
          <AnimatedDiv
            controls={controls}
            variants={createVariants(
              { top: 125, left: 340 },
              { top: 125, left: 240 },
              { hidden: 0, visible: 1 },
            )}
          >
            <Image
              className="opacity-50 rounded-spacing-s"
              src={AppUtils.getHomeAssetImageSource('noblewoman')}
              alt="noblewoman"
              width={75}
              height={75}
            />
          </AnimatedDiv>
        </div>
        {/* right side of 3 main characters roughly from top to bottom */}
        <AnimatedSmallCircleImage
          controls={controls}
          alt="philosopher"
          variants={createVariants({ top: 80, left: 440 })}
        />
        <AnimatedText
          text={t('Home.mentor')}
          controls={controls}
          variants={createVariants({ top: 97, left: 520 })}
          className="text-accent"
        />
        <AnimatedVoiceIcon
          controls={controls}
          variants={createVariants({ top: 150, left: 460 })}
        />
        <AnimatedSmallCircleImage
          controls={controls}
          alt="noblewoman"
          variants={createVariants(
            { top: 180, left: 540 },
            undefined,
            undefined,
            { hidden: 0.2, visible: 0.5 },
          )}
        />
        <AnimatedSmallCircleImage
          controls={controls}
          alt="zeus"
          variants={createVariants(
            { top: 230, left: 500 },
            undefined,
            undefined,
            { hidden: 0.2, visible: 0.5 },
          )}
        />
      </div>
    </div>
  );
};
