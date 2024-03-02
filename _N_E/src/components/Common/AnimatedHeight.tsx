import { forwardRef, useEffect, useRef, useState } from 'react';
import type { Height } from 'react-animate-height';
import AnimateHeight from 'react-animate-height';

export const AnimatedHeight = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>((props, ref) => {
  const [height, setHeight] = useState<Height>('auto');
  const contentDiv = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = contentDiv.current as HTMLDivElement;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]?.contentBoxSize[0]) {
        setHeight(entries[0].contentBoxSize[0].blockSize);
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <AnimateHeight
      {...props}
      ref={ref}
      height={height}
      contentClassName="auto-content"
      contentRef={contentDiv}
      duration={500}
      disableDisplayNone
    >
      {props.children}
    </AnimateHeight>
  );
});

AnimatedHeight.displayName = 'AnimateHeight';
