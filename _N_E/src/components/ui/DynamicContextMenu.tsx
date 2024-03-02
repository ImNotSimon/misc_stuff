import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';
import { type ContextItem } from './ui-types';

export function DynamicRightClickMenu({
  children,
  options,
}: {
  children: React.ReactNode;
  options: ContextItem[];
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {options.map((option) => (
          <ContextMenuItem key={option.key} asChild={option.asChild}>
            {option.content}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
