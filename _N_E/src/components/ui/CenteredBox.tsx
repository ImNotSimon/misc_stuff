import { cn } from '@/lib/utils';

export function CenteredBox({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
