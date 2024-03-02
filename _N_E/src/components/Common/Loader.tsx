import { cn } from '@/lib/utils';

export function Spinner({
  size,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        `loader border-r-2 border-t-2 border-r-transparent border-t-foreground `,
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
