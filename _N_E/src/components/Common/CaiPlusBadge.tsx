/* eslint-disable i18next/no-literal-string */
import { cn } from '@/lib/utils';

export function CaiPlusBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center font-medium bg-surface-elevation-2 p-1 rounded-spacing-xs text-medium',
        className,
      )}
    >
      c.ai<div className="text-plus font-bold">+</div>
    </div>
  );
}
