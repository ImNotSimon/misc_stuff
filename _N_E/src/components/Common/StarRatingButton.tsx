import { Button } from '@/components/ui/button';
import { FaRegStar } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import { AnimationFadeInAndOut } from './Animated';

export function StarRatingButton({
  filled,
  onPress,
}: {
  filled: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      isIconOnly
      onPress={onPress}
      variant="ghost"
      className="w-6 h-6 min-w-unit-0 p-1 data-[hover=true]:bg-transparent"
    >
      <AnimationFadeInAndOut key={`star${filled}`}>
        {filled ? (
          <FaStar size={16} />
        ) : (
          <FaRegStar color="var(--icon-secondary)" size={16} />
        )}
      </AnimationFadeInAndOut>
    </Button>
  );
}
