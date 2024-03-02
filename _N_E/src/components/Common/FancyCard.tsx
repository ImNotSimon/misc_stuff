import { cn } from '@/lib/utils';
import { useState } from 'react';

export function FancyCard({
  height = 280,
  width = 280,
  children,
  className,
}: {
  height?: number;
  width?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [mouseXpercentage, setMouseXPercentage] = useState(30);
  const [mouseYpercentage, setMouseYPercentage] = useState(0);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.
    const { offsetWidth } = e.currentTarget;
    const { offsetHeight } = e.currentTarget;
    setMouseXPercentage((x / offsetWidth) * 100);
    setMouseYPercentage((y / offsetHeight) * 100);
  };

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn(
        `rounded-spacing-m p-4 flex-col flex gap-4 card-effect`,
        className,
      )}
      style={{
        height,
        width,
        background: `radial-gradient(at 
              ${mouseXpercentage}% ${mouseYpercentage}%, var(--accent), var(--primary-foreground))`,
      }}
    >
      {children}
    </div>
  );
}
