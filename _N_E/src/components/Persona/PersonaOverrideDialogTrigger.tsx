import { type CharacterDetailed } from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { ChevronRightIcon, ProfileFilledIcon } from '../ui/Icon';
import { Button } from '../ui/button';

type PersonaOverrideDialogTriggerProps = {
  activePersonas: Partial<CharacterDetailed>[];
  setOpen: (val: boolean) => void;
};

export const PersonaOverrideDialogTrigger = ({
  activePersonas,
  setOpen,
}: PersonaOverrideDialogTriggerProps) => (
  <Button
    variant="ghost"
    className="w-full flex justify-between gap-2 rounded-spacing-xs"
    onPress={() => {
      setOpen(true);
    }}
  >
    <div className="flex items-center w-fit gap-3">
      <ProfileFilledIcon className="text-muted-foreground size-5" />
      {t('Common.persona')}
    </div>
    <div className="flex gap-1 items-center">
      {activePersonas.length > 0 && (
        <p className="line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal text-muted-foreground">
          {activePersonas[0].participant__name}
        </p>
      )}
      <div>
        <ChevronRightIcon className="text-muted-foreground size-3" />
      </div>
    </div>
  </Button>
);
