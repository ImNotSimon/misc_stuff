import * as React from 'react';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

export function DynamicTooltipProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return <TooltipProvider {...props}>{children}</TooltipProvider>;
}

export interface DynamicTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const DynamicTooltip = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
  } & DynamicTooltipProps
>(({ children, content, side, className, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip delayDuration={0} open={open}>
      <TooltipTrigger
        asChild
        onMouseEnter={() => {
          setOpen(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        ref={ref}
        className={className}
        {...props}
      >
        {content}
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
});
DynamicTooltip.displayName = 'DynamicTooltip';
