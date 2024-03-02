import { useMemo, type ReactNode } from 'react';

import { forwardRef } from '@/components/ui/util/utils';
import { ListboxSelectedIcon } from './listbox-selected-icon';
// eslint-disable-next-line import/no-cycle
import { useListboxItem, type UseListboxItemProps } from './use-listbox-item';

export type ListboxItemProps<T extends object = object> =
  UseListboxItemProps<T>;

/**
 * @internal
 */
const ListboxItem = forwardRef<'li', ListboxItemProps>((props, _) => {
  const {
    Component,
    rendered,
    description,
    isSelectable,
    isSelected,
    isDisabled,
    selectedIcon,
    startContent,
    endContent,
    hideSelectedIcon,
    disableAnimation,
    getItemProps,
    getLabelProps,
    getWrapperProps,
    getDescriptionProps,
    getSelectedIconProps,
  } = useListboxItem(props);

  const selectedContent = useMemo<ReactNode | null>(() => {
    const defaultIcon = (
      <ListboxSelectedIcon
        disableAnimation={disableAnimation}
        isSelected={isSelected}
      />
    );

    if (typeof selectedIcon === 'function') {
      return selectedIcon({ icon: defaultIcon, isSelected, isDisabled });
    }

    if (selectedIcon) return selectedIcon;

    return defaultIcon;
  }, [selectedIcon, isSelected, isDisabled, disableAnimation]);

  return (
    <Component {...getItemProps()}>
      {startContent}
      {description ? (
        <div {...getWrapperProps()}>
          <span {...getLabelProps()}>{rendered}</span>
          <span {...getDescriptionProps()}>{description}</span>
        </div>
      ) : (
        <span {...getLabelProps()}>{rendered}</span>
      )}
      {!!isSelectable && !hideSelectedIcon && (
        <span {...getSelectedIconProps()}>{selectedContent}</span>
      )}
      {endContent}
    </Component>
  );
});

ListboxItem.displayName = 'NextUI.ListboxItem';

export default ListboxItem;
