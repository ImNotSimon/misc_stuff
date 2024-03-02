/* eslint-disable no-bitwise */

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { subscribeToWaveForm } from '@/lib/voice/mediaConnection';
import { linearPath } from '@/lib/voice/svgPathGenerator';
import { scrollToBottom } from '@/views/chat/ChatHooks';

const linearOptions = {
  type: 'mirror',
  top: 0,
  paths: [{ d: 'V', sy: 0, x: 50, ey: 100 }],
};

export function VoiceSoundWave() {
  const pathElement = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathElement.current) {
      return;
    }
    const stopWaitingAnimation = animateSoundWave(pathElement.current);
    const unsubscribe = subscribeToWaveForm((data) => {
      stopWaitingAnimation();
      const path = linearPath(data, linearOptions);
      pathElement.current?.setAttribute('d', path);
    });
    return () => {
      unsubscribe();
      stopWaitingAnimation();
    };
  }, []);

  // Scroll to bottom when the component is mounted.
  useLayoutEffect(() => scrollToBottom(), []);

  return (
    <div className="w-full">
      <svg height="100" width="100%">
        <defs>
          <linearGradient
            id="voiceWaveGrad"
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: 'rgb(75,108,163)', stopOpacity: '1.00' }}
            />
            <stop
              offset="25%"
              style={{ stopColor: 'rgb(93,141,221)', stopOpacity: '0.70' }}
            />
            <stop
              offset="50%"
              style={{ stopColor: 'rgb(44,66,103)', stopOpacity: '1.00' }}
            />
            <stop
              offset="75%"
              style={{ stopColor: 'rgb(72,124,211)', stopOpacity: '0.70' }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'rgb(91,152,255)', stopOpacity: '1.00' }}
            />
          </linearGradient>
        </defs>
        <path
          ref={pathElement}
          strokeWidth="3px"
          fill="none"
          stroke="url(#voiceWaveGrad)"
        />
      </svg>
    </div>
  );
}

export function WaveFormDots() {
  const numDots = 3;
  const [values, setValues] = useState(new Array(numDots).fill(0));

  useEffect(() => {
    const { stop: stopValueProduction, push: pushDownsampledData } =
      produceValues(numDots, setValues);

    const downsampledData = new Array(numDots);
    const unsubscribe = subscribeToWaveForm((data) => {
      const windowSize = Math.floor(data.length / numDots);

      // Downsample the original data, and push it to the value generator.
      for (let i = 0; i < numDots; i++) {
        let sum = 0;
        for (let from = windowSize * i, j = from; j < from + windowSize; j++) {
          sum += Math.min(1, Math.abs(data[j]) * 5);
        }
        downsampledData[i] = sum / windowSize;
      }
      pushDownsampledData(downsampledData);
    });
    return () => {
      unsubscribe();
      stopValueProduction();
    };
  }, []);

  return (
    <div className="flex flex-row gap-1 items-center h-3">
      {values.map((height, idx) => (
        <div
          key={idx}
          style={{ height: `${height}px` }}
          className="bg-white rounded-md w-1 h-2 transition-[height]"
        />
      ))}
    </div>
  );
}

function generateSample(i: number) {
  const size = 128;
  const data = new Float32Array(size);

  const progress = (i % 100) / 100;
  const shouldGoFoward = ~~(i / 100) % 2 === 0;
  const amplitude = shouldGoFoward ? 0.2 * progress : 0.2 * (1 - progress);
  const maxAngle = Math.PI * 2;
  const angleDelta = maxAngle / size;
  let angle = maxAngle * progress;

  for (let j = 0; j < size; j++) {
    data[j] = Math.max(
      0.2,
      Math.abs(Math.cos(angle % maxAngle) * (0.2 + amplitude)),
    );
    angle += angleDelta;
  }
  return data;
}

function animateSoundWave(pathElement: SVGPathElement) {
  let i = 0;
  let stopped = false;
  const frame = () => {
    if (stopped) {
      return;
    }
    i++;
    const path = linearPath(generateSample(i), linearOptions);
    pathElement.setAttribute('d', path);
    requestAnimationFrame(frame);
  };
  frame();
  return () => {
    stopped = true;
  };
}

function generateGaussianValues(count: number, σ: number, μ: number) {
  const values = new Array(count);
  const delta = 8 / count;

  // Implements: https://en.wikipedia.org/wiki/Normal_distribution
  const gaussian = (x: number) =>
    (1 / (σ * Math.sqrt(2 * Math.PI))) **
    (Math.E ** ((-1 / 2) * ((x - μ) / σ) ** 2));

  let x = -delta * Math.floor(count / 2);
  for (let i = 0; i < count; i++) {
    const y = gaussian(x);
    values[i] = y;
    x += delta;
  }
  return values;
}

function produceValues(count: number, setter: (values: number[]) => void) {
  const values = generateGaussianValues(count, 0.2, 0);
  const maxRingBufferSize = 5;
  const buffer: number[][] = [];
  const fps = 8;

  let stopped = false;
  const frame = () => {
    if (stopped) {
      return;
    }
    if (buffer.length === 0) {
      setter(values.map((value) => value * (5 + Math.random() * 2)));
    } else {
      const data = buffer.pop();
      if (data != null) {
        setter(values.map((value, idx) => 5 + value * (data[idx] * 10)));
      }
    }
    setTimeout(frame, 1000 / fps);
  };

  let dataIdx = 0;
  const push = (data: number[]) => {
    if (buffer.length < maxRingBufferSize) {
      buffer.push(data);
    } else {
      buffer[maxRingBufferSize % dataIdx] = data;
    }
    dataIdx++;
  };

  const stop = () => {
    stopped = true;
  };

  frame();

  return { push, stop };
}
