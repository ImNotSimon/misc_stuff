import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  AppUtils,
  selectCharacterColor,
  type CDN_SIZE,
} from '@/utils/appUtils';
import {
  placeholderDataUrlDark,
  placeholderDataUrlLight,
} from '@/utils/constants';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useMemo, type CSSProperties } from 'react';

export type CharacterAvatarProps = {
  src?: string;
  name: string;
  size: number;
  height?: number;
  cdnOverride?: CDN_SIZE;
  style?: CSSProperties;
  circle?: boolean;
  animated?: boolean;
  priority?: boolean;
  loading?: 'eager' | 'lazy' | undefined;
  backgroundOverride?: string;
  className?: string;
};

// clickable avatar that opens a dialog with a larger version of the avatar
export function FocusableCharacterAvatar(props: CharacterAvatarProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <CharacterAvatar {...props} />
      </DialogTrigger>
      <DialogContent
        hideClose
        className="bg-transparent outline-none border-none shadow-none"
      >
        <CharacterAvatar {...props} size={256} />
      </DialogContent>
    </Dialog>
  );
}

export function CharacterAvatar({
  name,
  src,
  size,
  height,
  cdnOverride,
  style,
  loading,
  backgroundOverride,
  animated = false,
  circle = true,
  priority = false, // todo:: figure out what images are visible and SSR them (set to true)
  className = '',
}: CharacterAvatarProps) {
  const characterColors = useMemo(() => selectCharacterColor(name), [name]);
  const { theme } = useTheme();
  const placeholderDataUrl =
    theme === 'dark' ? placeholderDataUrlDark : placeholderDataUrlLight;
  const url = new URL(
    AppUtils.getCDNImageSource(src, cdnOverride ?? AppUtils.getCDNSize(size)),
  );
  if (!animated) {
    url.searchParams.set('anim', '0');
  }

  const borderRatio = 0.16;

  return (
    <Avatar
      className={cn('shrink-0 grow-0', className)}
      style={{
        width: size,
        height: height ?? size,
        ...style,
        // calculate radius ratio based on size
        borderRadius: circle ? size : Math.round(size * borderRatio),
        // behold the conic gradient!
        // this could be achieved similarly with a linear or radial gradient but it wouldnt look quite as good
        background:
          backgroundOverride ??
          (src
            ? ''
            : `linear-gradient(310deg, var(--background) 12%,  ${characterColors.primary} 90%, ${characterColors.tertiary} 100%)`),
      }}
      title={name}
    >
      {src ? (
        <Image
          alt={name}
          className="object-cover object-center bg-card shrink-0 grow-0 h-full"
          priority={priority}
          src={url.href}
          height={height ?? size}
          width={size}
          blurDataURL={placeholderDataUrl}
          placeholder={size > 40 ? 'blur' : 'empty'}
          loading={loading}
        />
      ) : (
        <div
          className="flex justify-center items-center w-full font-bold opacity-75"
          style={{ fontSize: size * 0.4 }}
        >
          {name.slice(0, 1)}
        </div>
      )}
    </Avatar>
  );
}
