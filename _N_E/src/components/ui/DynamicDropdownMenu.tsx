import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ContextItem } from './ui-types';
import { cn } from './util/utils';

export function DynamicDropdownMenu({
  children,
  options,
  isOpen,
  setIsOpen,
  triggerClassName,
  contentClassName,
  itemClassName,
  side,
}: {
  children: React.ReactNode;
  options: ContextItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className={triggerClassName}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="end"
        className={cn(
          'flex flex-col rounded-spacing-m overflow-hidden shadow-md w-64',
          contentClassName,
        )}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            asChild={option.asChild}
            className={cn(itemClassName)}
          >
            {option.content}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
