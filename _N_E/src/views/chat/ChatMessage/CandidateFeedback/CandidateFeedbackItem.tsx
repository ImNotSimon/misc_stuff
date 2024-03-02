import { Checkbox } from '@/components/ui/Checkbox';
import { ToggleGroupItem } from '@/components/ui/toggle-group';
import { labelNameMap } from './FeedbackUtils';

export function CandidateFeedbackItem({
  id,
  label,
  onClick,
  isSelected,
}: {
  id?: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <ToggleGroupItem
      className="flex justify-start text-start h-7 md:h-10 bg-transparent w-[40%] gap-3 data-[state=on]:bg-transparent"
      onClick={onClick}
      value={label}
    >
      <Checkbox
        id={id}
        className={!isSelected ? 'opacity-50' : undefined}
        color={isSelected ? undefined : 'var(--muted-foreground)'}
        checked={isSelected}
      />
      {labelNameMap[label]}
    </ToggleGroupItem>
  );
}
