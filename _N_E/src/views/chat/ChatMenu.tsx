import { VoiceToggle } from '@/components/Voice/VoiceToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { ChatDetailsContent } from './ChatDetails';

type ChatMenuProps = {
  characterId: string;
};

export function ChatMenu({ characterId }: ChatMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <VoiceToggle isCompact />
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              isIconOnly
              onPress={() => {
                setOpen(true);
              }}
            >
              <BsThreeDots />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex h-screen flex-col w-96">
            <ChatDetailsContent
              characterId={characterId}
              closeMenu={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
