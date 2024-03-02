import { ModerationReportFlow } from '@/components/Moderation/ModerationReportFlow';
import { ReportCharacterDialogTrigger } from '@/components/Moderation/ReportCharacterDialogTrigger';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import { type CharacterModerationPayload } from '@character-tech/client-common/src/types/moderation';
import { useState } from 'react';

export function ReportCharacterDialog({
  character,
  referrer,
}: {
  character: Character;
  referrer?: string;
}) {
  const [open, setOpen] = useState(false);

  const report: CharacterModerationPayload = {
    type: 'CHARACTER',
    character,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer, type: 'ReportCharacterDialog' }}
    >
      <ReportCharacterDialogTrigger setOpen={setOpen} />
      <DialogContent className="flex-auto flex flex-col justify-between w-[400px] gap-2 pt-0">
        <div className="w-full h-full overflow-y-auto mt-3">
          <ModerationReportFlow
            report={report}
            onComplete={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
