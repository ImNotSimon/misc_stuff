'use client';

import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { type CharacterScenario } from '@/types/types';
import { shuffleArray } from '@/utils/appUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import { AmplitudeVariants } from '@/analytics/AmplitudeExperimentationFactory';
import { useAmplitudeVariantValue } from '@/analytics/analyticsHooks';
import { CharacterScenarioTile } from './CharacterScenario';
import { HeroScenario } from './HeroScenario';

// import required modules
// animation variants for each tile in the shelf
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

// TODO: localize and move these to an endpoint / dynamic config
const scenarios: CharacterScenario[] = [
  {
    question: t('Scenarios.what-do-you-want-to-do'),
    answer: t('Scenarios.travel.go-on-an-adventure'),
    characterIds: [
      'GS_OvZ-lQyol_APHNZxOoHnc3LaanTvKeyROJhThpTw',
      'aOfH1UKakUv-x3uNz8mG13kQx4lt28-RFkDcSc6gCck',
    ],
    videoSrc: 'https://characterai.io/static/editorial/scenarios/travel_s.mp4',
  },
  {
    question: t('Scenarios.what-do-you-want-to-do'),
    answer: t('Scenarios.creativity.nurture-your-creativity'),
    characterIds: [
      'arSFby5bCipvQXcsMxxkYLRALdWZOC8Ub5pFtGklplc',
      'v3t5o5EX32l-gB77NYX3l9Rh8C1lIGYSkI-HVNSg7r0',
    ],
    videoSrc:
      'https://characterai.io/static/editorial/scenarios/creativity_s.mp4',
  },
  {
    question: 'Time to feel your best',
    answer: 'Get fit and healthy',
    characterIds: [
      'zADxAm8Kj3mG-Q_-BW4Sid_2R93_6Wbwn624Dcj97eA',
      '-5jgnIpNmQuiuD6bL55MOtASTbvscvGR_cqvfqAE08M',
    ],
    videoSrc: 'https://characterai.io/static/editorial/scenarios/waterfall.mp4',
  },
  {
    question: 'Who do you want to talk to?',
    answer: 'A Trusted Circle of Support',
    characterIds: [
      'MOShz6OM2KhNGtuigfTGuLEM9UtSKYFv4P8cKuMTPgg',
      'tTAS4lqAmkceojvxPBEE79OtxoBbXmsIntaQ6RG_4kI',
    ],
    videoSrc:
      'https://characterai.io/static/editorial/scenarios/lighthouse.mp4',
  },
  {
    answer: 'Learn something new today',
    question: 'What do you want to do?',
    characterIds: [
      'nW7KYac14FpdUnugT4811pD-zHBCUZmfNU68x9oKoI0',
      'S0nUbNqZf-iuFYxCO4NJsanAoZHhbNLBNB-eUHc-xZY',
    ],
    videoSrc: 'https://characterai.io/static/editorial/scenarios/library.mp4',
  },
  {
    answer: 'Epic Challenges Await',
    question: 'What do you want to do?',
    characterIds: [
      'tkhOCDS13d53UxbMHPspMMsCuaMHvlvf8XyPs2NnzHI',
      '6AVP64tYv-bpx35cjZz_liuhqbksYo7BRYgVepiKO0U',
    ],
    videoSrc: 'https://characterai.io/static/editorial/scenarios/dice.mp4',
  },
];
const randomScenarios = shuffleArray(scenarios);

export function HeroScenarios() {
  const heroScenariosEnabled = useAmplitudeVariantValue(
    AmplitudeVariants.HeroScenarios,
    'treatment',
  );
  const [scenario, setScenario] = useState(0);

  const flipScenario = useCallback(
    () =>
      setScenario((prevScenarios) => (prevScenarios + 1) % scenarios.length),
    [],
  );

  useEffect(() => {
    const timer = setInterval(() => flipScenario(), 15000);
    return () => clearInterval(timer);
  }, [flipScenario]);

  if (heroScenariosEnabled === false) {
    return null;
  }

  return (
    <AnimationFadeInAndOut
      className="rounded-lg gap-10 bg-card items-center justify-between hidden xl:flex my-6 relative"
      key={scenario}
    >
      <HeroScenario
        scenario={scenarios[scenario]}
        flipScenario={flipScenario}
      />
      <AnimatePresence>
        <Swiper
          slidesPerView="auto"
          className="z-50"
          style={{ marginRight: 4 }}
          spaceBetween={16}
          cssMode
        >
          {randomScenarios[scenario]?.characterIds.map((char, index) => (
            <SwiperSlide key={index} style={{ width: 'auto' }}>
              <motion.div
                key={index}
                variants={variants}
                initial="hidden"
                animate="visible"
                custom={index} // Pass index for staggered animation
              >
                <CharacterScenarioTile characterId={char} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimatePresence>
    </AnimationFadeInAndOut>
  );
}
