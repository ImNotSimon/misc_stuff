'use client';

import { GuideCenterContent } from '@/components/Guide/GuideCenterContent';
import { GuideCollapseIcon } from '@/components/Guide/GuideIcons';
import { GuideLowerContent } from '@/components/Guide/GuideLowerContent';
import { GuideUpperContent } from '@/components/Guide/GuideUpperContent';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CaiLogo } from '../Common/CaiLogo';

export function GuideContent({ onCollapse }: { onCollapse: () => void }) {
  const { isPlusUser } = useAuth();

  const renderGuideContent = () => (
    <>
      <div className="flex grow flex-col overflow-hidden mt-4">
        <GuideUpperContent />
        <GuideCenterContent />
      </div>
      <div className={cn('flex flex-col justify-end pb-2 px-5')}>
        <GuideLowerContent />
      </div>
    </>
  );

  return (
    <div className="h-full border-r border-r-border-divider w-64">
      <div className="flex h-full flex-col overflow-hidden bg-primary-foreground  border-r-border-divider w-full">
        <div className="pl-6 pt-6 grid grid-cols-2 w-full items-center">
          <Link href="/">
            <CaiLogo isPlus={isPlusUser} />
          </Link>
          <Button
            className="justify-self-end mr-2"
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={onCollapse}
          >
            <GuideCollapseIcon className="h-full" />
          </Button>
        </div>
        {renderGuideContent()}
      </div>
    </div>
  );
}
