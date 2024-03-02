import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AppUtils, selectCharacterColor } from '@/utils/appUtils';
import Image from 'next/image';
import { useMemo, type CSSProperties } from 'react';

type HumanAvatarProps = {
  src?: string;
  name: string;
  size: number;
  style?: CSSProperties;
  // eslint-disable-next-line react/no-unused-prop-types
  rounded?: boolean;
  animated?: boolean;
  priority?: boolean;
};

// clickable avatar that opens a dialog with a larger version of the avatar
export function FocusableHumanAvatar(props: HumanAvatarProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <HumanAvatar {...props} />
      </DialogTrigger>
      <DialogContent
        hideClose
        className="bg-transparent outline-none border-none shadow-none"
      >
        <HumanAvatar {...props} size={256} />
      </DialogContent>
    </Dialog>
  );
}

export function HumanAvatar({
  name,
  src,
  size,
  style,
  animated = false,
  priority = false,
}: HumanAvatarProps) {
  const characterColors = useMemo(() => selectCharacterColor(name), [name]);
  const url = new URL(
    AppUtils.getCDNImageSource(src, AppUtils.getCDNSize(size)),
  );
  if (!animated) {
    url.searchParams.set('anim', '0');
  }

  return (
    <Avatar
      title={name}
      style={{
        width: size,
        height: size,
        background: src
          ? ''
          : `linear-gradient(134deg, var(--background) 12%,  ${characterColors.primary} 90%, ${characterColors.tertiary} 100%)`,
        ...style,
      }}
    >
      {src ? (
        <Image
          alt={name}
          className="object-cover object-top"
          priority={priority}
          src={url.href}
          fill
        />
      ) : (
        <div
          className="flex justify-center items-center w-full font-bold opacity-90"
          style={{ fontSize: size * 0.4 }}
        >
          {name.slice(0, 1)}
        </div>
      )}
    </Avatar>
  );
}
