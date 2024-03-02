import {
  CheckFilledIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
} from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { type ContextItem } from '@/components/ui/ui-types';
import { t } from 'i18next';

interface UsePersonaMenuOptionsProps {
  handleEdit: () => void;
  handleToggleDefault: () => Promise<void>;
  handleDelete: () => void;
  isDefault?: boolean;
}

const MenuOption = ({
  label,
  Icon,
  handleClick,
  handleAsyncClick,
}: {
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  handleClick?: () => void;
  handleAsyncClick?: () => Promise<void>;
}) => (
  <Button
    className="w-full flex justify-between bg-transparent hover:bg-[--transparency-4] text-primary rounded-spacing-xs"
    onPress={async () => {
      handleClick?.();
      await handleAsyncClick?.();
    }}
    preventDefault
  >
    {label}
    <Icon width="1rem" height="1rem" />
  </Button>
);

export const createMenuOptionsList = ({
  handleEdit,
  handleToggleDefault,
  handleDelete,
  isDefault,
}: UsePersonaMenuOptionsProps) => {
  const menuOptions: ContextItem[] = [
    {
      content: (
        <MenuOption
          key="option-edit"
          label={t('Common.edit')}
          Icon={EditIcon}
          handleClick={handleEdit}
        />
      ),
      asChild: true,
      key: 'option-edit',
    },
    {
      content: (
        <MenuOption
          key="option-default"
          label={
            isDefault ? t('Common.clear-default') : t('Common.make-default')
          }
          Icon={isDefault ? CheckIcon : CheckFilledIcon}
          handleAsyncClick={handleToggleDefault}
        />
      ),
      asChild: true,
      key: 'option-default',
    },
  ];

  menuOptions.push({
    content: (
      <MenuOption
        key="option-remove"
        label={t('Form.remove')}
        Icon={TrashIcon}
        handleClick={handleDelete}
      />
    ),
    asChild: true,
    key: 'option-remove',
  });

  return menuOptions;
};

export const usePersonaMenuOptions = (props: UsePersonaMenuOptionsProps) => {
  const menuOptions: ContextItem[] = createMenuOptionsList(props);
  return menuOptions;
};
