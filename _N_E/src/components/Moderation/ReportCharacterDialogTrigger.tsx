import { t } from 'i18next';
import { ReportIcon } from '../ui/Icon';
import { Button } from '../ui/button';

type ReportCharacterDialogTriggerProps = {
  setOpen: (val: boolean) => void;
};

export const ReportCharacterDialogTrigger = ({
  setOpen,
}: ReportCharacterDialogTriggerProps) => (
  <Button
    variant="outline"
    isIconOnly
    onPress={() => setOpen(true)}
    aria-label={t('Common.report')}
  >
    <ReportIcon className="size-4 text-muted-foreground" />
  </Button>
);
