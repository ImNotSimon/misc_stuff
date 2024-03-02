'use client';

import * as TooltipPrimitives from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitives.Provider;

const Tooltip = TooltipPrimitives.Root;

const TooltipTrigger = TooltipPrimitives.Trigger;

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitives.TooltipArrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitives.TooltipArrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitives.TooltipArrow
    ref={ref}
    fill="currentColor"
    className={cn('text-surface-elevation-2', className)}
    {...props}
  />
));
TooltipArrow.displayName = 'TooltipArrow';

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Content>
>(({ className, ...props }, ref) => (
  <TooltipPrimitives.Content
    ref={ref}
    className={cn(
      'text-md bg-surface-elevation-2 text-foreground p-2 rounded-spacing-xs',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
