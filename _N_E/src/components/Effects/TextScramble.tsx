/* eslint-disable no-promise-executor-return */
import { useEffect, useRef, useState } from 'react';

class TextScrambleHandler {
  el: HTMLDivElement;

  chars: string;

  queue: {
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }[];

  resolve: (value: unknown | undefined) => void;

  frameRequest: number;

  frame: number;

  constructor(el: HTMLDivElement) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    this.frameRequest = 0;
    this.queue = [];
    this.frame = 0;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.resolve = () => {};
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    // eslint-disable-next-line no-return-assign
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      const val = this.queue[i];
      if (val == null) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const { from, to, start, end } = val;
      let { char } = val;
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="text-muted-foreground">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve({});
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

export function TextScambleEffect({
  phrases,
  className = '',
  autoInterval = 0,
}: {
  phrases: string[];
  className?: string;
  autoInterval?: number;
}) {
  const textRef = useRef(null);
  const interval = useRef<NodeJS.Timeout>();
  const autoIntervalRef = useRef<NodeJS.Timeout>();

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    clearTimeout(interval.current);

    if (textRef.current) {
      const fx = new TextScrambleHandler(textRef.current);
      interval.current = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        void fx.setText(phrases[counter]!);
      }, 600);
    }

    return () => clearTimeout(interval.current);
  }, [phrases, counter]);

  useEffect(() => {
    if (autoInterval) {
      autoIntervalRef.current = setInterval(() => {
        setCounter((counter + 1) % phrases.length);
      }, autoInterval);
    }
  }, [autoInterval, counter, phrases.length]);

  return (
    <div
      className={className}
      ref={textRef}
      onMouseEnter={() => {
        setCounter((counter + 1) % phrases.length);
      }}
    />
  );
}
