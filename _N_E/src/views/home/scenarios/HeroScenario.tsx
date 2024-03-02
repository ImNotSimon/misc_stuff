import { logAnalyticsEvent } from '@/analytics/analytics';
import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { Button } from '@/components/ui/button';
import { type CharacterScenario } from '@/types/types';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { FaRepeat } from 'react-icons/fa6';

export function HeroScenario({
  scenario,
  flipScenario,
}: {
  scenario: CharacterScenario;
  flipScenario: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const width = 800;
  const height = 300;
  return (
    <div
      className="h-[300px] bg-contain overflow-hidden rounded-lg rounded-r-none absolute w-full z-0"
      style={{ minWidth: width / 2, maxWidth: width }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        controls={false}
        style={{ width, height }}
        className="object-cover object-center select-none"
        id="hero-scenario-video"
      >
        <source src={scenario.videoSrc} type="video/mp4" />
      </video>
      <div
        className="m-h-[300px] h-[300px] absolute z-10 top-0"
        style={{
          width,
          backgroundImage:
            'linear-gradient(to left, var(--card), var(--hero-transparent))',
        }}
      />
      <div className="absolute z-10 p-10 justify-between h-full items-start flex flex-col top-0">
        <div>
          <div className="text-muted-foreground text-lg">
            {scenario.question}
          </div>
          <div className="text-display typing-effect">{scenario.answer}</div>
        </div>
        <Button
          autoFocus={false}
          onPress={() => {
            logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
              referrer: 'HeroScenario',
              value: 'FlipScenario',
            });
            setRotation(rotation + 360);
            flipScenario();
          }}
          isIconOnly
          variant="ghost"
          className="bg-[--transparency-4] text-[var(--G150)]"
        >
          <motion.div
            animate={{
              rotate: rotation,
            }}
          >
            <AnimationFadeInAndOut>
              <FaRepeat size={18} />
            </AnimationFadeInAndOut>
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
