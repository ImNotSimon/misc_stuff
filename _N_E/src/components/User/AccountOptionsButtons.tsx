import { type PressEvent } from '@react-types/shared';
import { t } from 'i18next';
import { CircleArrowDown, WarningFilledIcon } from '../ui/Icon';
import { Button } from '../ui/button';

export const ExportData = ({ handleExport }: { handleExport: () => void }) => (
  <Button
    variant="ghost"
    className="w-full flex justify-between text-muted-foreground rounded-spacing-0"
    onPress={handleExport}
    endContent={<CircleArrowDown height="16px" />}
  >
    {t('Common.export-data')}
  </Button>
);

export const DeleteData = ({
  onPress,
}: {
  onPress: (e: PressEvent) => void;
}) => (
  <Button
    variant="ghost"
    className="w-full flex justify-between text-error rounded-spacing-0"
    onPress={onPress}
    endContent={<WarningFilledIcon height="16px" />}
  >
    {t('Common.delete-account')}
  </Button>
);
