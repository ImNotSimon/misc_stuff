import { type AnalyticsProps } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type SettingsButtonProps = {
  highlighted?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  analyticsProps?: AnalyticsProps;
  onPress?: () => void;
  children: ReactNode;
};

export function SettingsButton({
  highlighted,
  disabled,
  icon,
  analyticsProps,
  onPress,
  children,
}: SettingsButtonProps) {
  return (
    <Button
      variant="ghost"
      isDisabled={disabled}
      className={cn(
        'sm:w-full sm:justify-start rounded-spacing-s font-normal',
        highlighted && 'bg-accent',
      )}
      analyticsProps={analyticsProps}
      onPress={onPress}
    >
      {!!icon && <div className="mr-2">{icon}</div>}
      {children}
    </Button>
  );
}
