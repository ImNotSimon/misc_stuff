/* eslint-disable i18next/no-literal-string */
import { CaiLogoTypeMark } from '@/components/Common/CaiLogotype';
import { cn } from '@/lib/utils';

export function CaiLogo({
  className,
  mini,
  isPlus,
}: {
  isPlus?: boolean;
  mini?: boolean;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        `text-2xl font-sans font-semibold flex items-center`,
        className,
      )}
    >
      {mini ? 'c.ai' : <CaiLogoTypeMark className="text-foreground" />}
      {!!isPlus && <div className="text-plus">+</div>}
    </div>
  );
}
