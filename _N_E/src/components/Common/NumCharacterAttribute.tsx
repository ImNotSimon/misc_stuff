import { AppUtils } from '@/utils/appUtils';
import { t } from 'i18next';
import { ChatIcon, ThumbsUpIcon } from '../ui/Icon';

export const NumCharacterAttribute = ({
  num,
  type,
  capitalized,
  iconProps,
  withPrecedingDot,
}: {
  num: number;
  type: 'interactions' | 'upvotes';
  capitalized?: boolean;
  iconProps?: { className?: string; size: string };
  withPrecedingDot?: boolean;
}) => {
  const Icon = type === 'interactions' ? ChatIcon : ThumbsUpIcon;
  const translationKey = type === 'interactions' ? 'chats' : 'likes';

  return (
    <>
      {!!withPrecedingDot && <p>•</p>}
      {!!iconProps && (
        <Icon
          width={iconProps.size}
          height={iconProps.size}
          className={iconProps.className}
        />
      )}
      <p>
        {capitalized
          ? t(`Common.${translationKey}`, {
              count: num,
              formattedCount: AppUtils.formatNumber(num),
            })
          : t(`Common.num-${translationKey}`, {
              count: num,
              num: AppUtils.formatNumber(num),
            })}
      </p>
    </>
  );
};
