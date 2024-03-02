/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-extraneous-dependencies */

import { type ListboxItemBaseProps } from '@/components/ui/listbox/base/listbox-item-base';
import { listboxItem } from '@/components/ui/theme/components/listbox';
import { dataAttr } from '@/components/ui/util/assertion';
import { filterDOMProps } from '@/components/ui/util/filterDomProps';
import { HTMLNextUIProps, PropGetter } from '@/components/ui/util/types';
import { mapPropsVariants } from '@/components/ui/util/utils';
import { useFocusRing } from '@react-aria/focus';
import { useHover, usePress } from '@react-aria/interactions';
import { useOption } from '@react-aria/listbox';
import { mergeProps } from '@react-aria/utils';
import { type ListState } from '@react-stately/list';
import {
  type DOMAttributes,
  type FocusableElement,
  type Node,
} from '@react-types/shared';
import clsx from 'clsx';
import { CSSProperties, useCallback, useMemo, useRef } from 'react';
import { isMobile } from 'react-device-detect';

interface Props<T extends object> extends ListboxItemBaseProps<T> {
  item: Node<T>;
  state: ListState<T>;
}

export type UseListboxItemProps<T extends object> = Props<T> &
  Omit<HTMLNextUIProps<'li'>, keyof Props<T>>;

export function useListboxItem<T extends object>(
  originalProps: UseListboxItemProps<T>,
) {
  const [props, variantProps] = mapPropsVariants(
    originalProps,
    listboxItem.variantKeys,
  );

  const {
    as,
    item,
    state,
    description,
    startContent,
    endContent,
    isVirtualized,
    selectedIcon,
    className,
    classNames,
    autoFocus,
    onPress,
    onClick,
    shouldHighlightOnFocus,
    hideSelectedIcon = false,
    isReadOnly = false,
    ...otherProps
  } = props;

  const { disableAnimation } = originalProps;

  const domRef = useRef<HTMLLIElement>(null);

  const Component = as || (originalProps.href ? 'a' : 'li');
  const shouldFilterDOMProps = typeof Component === 'string';

  const { rendered, key } = item;

  const isDisabled = state.disabledKeys.has(key) || originalProps.isDisabled;
  const isSelectable = state.selectionManager.selectionMode !== 'none';

  const { pressProps, isPressed } = usePress({
    ref: domRef,
    isDisabled,
    onPress,
  });

  const { isHovered, hoverProps } = useHover({
    isDisabled,
  });

  const { isFocusVisible, focusProps } = useFocusRing({
    autoFocus,
  });

  const { isFocused, isSelected, optionProps, labelProps, descriptionProps } =
    useOption(
      {
        key,
        isDisabled,
        'aria-label': props['aria-label'],
        isVirtualized,
      },
      state,
      domRef,
    );

  let itemProps = optionProps;

  const slots = useMemo(
    () =>
      listboxItem({
        ...variantProps,
        isDisabled,
        disableAnimation,
      }),
    [...Object.values(variantProps), isDisabled, disableAnimation],
  );

  const baseStyles = clsx(classNames?.base, className);

  if (isReadOnly) {
    itemProps = removeEvents(itemProps);
  }

  const isHighlighted = useMemo(() => {
    if (shouldHighlightOnFocus && isFocused) {
      return true;
    }

    return isMobile ? isHovered || isPressed : isHovered;
  }, [isHovered, isPressed, isFocused, isMobile, shouldHighlightOnFocus]);

  const getItemProps: PropGetter = (props = {}) => ({
    ref: domRef,
    ...mergeProps(
      { onClick },
      itemProps,
      isReadOnly ? {} : mergeProps(focusProps, pressProps),
      hoverProps,
      filterDOMProps(otherProps, {
        enabled: shouldFilterDOMProps,
      }),
      props,
    ),
    'data-selectable': dataAttr(isSelectable),
    'data-focus': dataAttr(isFocused),
    'data-hover': dataAttr(isHighlighted),
    'data-disabled': dataAttr(isDisabled),
    'data-selected': dataAttr(isSelected),
    'data-pressed': dataAttr(isPressed),
    'data-focus-visible': dataAttr(isFocusVisible),
    className: slots.base({ class: clsx(baseStyles, props.className) }),
  });

  const getLabelProps: PropGetter = (props = {}) => ({
    ...mergeProps(labelProps, props),
    'data-label': dataAttr(true),
    className: slots.title({ class: classNames?.title }),
  });

  const getDescriptionProps: PropGetter = (props = {}) => ({
    ...mergeProps(descriptionProps, props),
    className: slots.description({ class: classNames?.description }),
  });

  const getWrapperProps: PropGetter = (props = {}) => ({
    ...mergeProps(props),
    className: slots.wrapper({ class: classNames?.wrapper }),
  });

  const getSelectedIconProps = useCallback<PropGetter>(
    (props = {}) => ({
      'aria-hidden': dataAttr(true),
      'data-disabled': dataAttr(isDisabled),
      className: slots.selectedIcon({ class: classNames?.selectedIcon }),
      ...props,
    }),
    [isDisabled, slots, classNames],
  );

  return {
    Component,
    domRef,
    slots,
    classNames,
    isSelectable,
    isSelected,
    isDisabled,
    rendered,
    description,
    startContent,
    endContent,
    selectedIcon,
    hideSelectedIcon,
    disableAnimation,
    getItemProps,
    getLabelProps,
    getWrapperProps,
    getDescriptionProps,
    getSelectedIconProps,
  };
}

export type UseListboxItemReturn = ReturnType<typeof useListboxItem>;
function removeEvents(
  itemProps: DOMAttributes<FocusableElement>,
): import('@react-types/shared').DOMAttributes<
  import('@react-types/shared').FocusableElement
> {
  const newItemPropsStyle = {
    ...(itemProps.style ?? {}),
    pointerEvents: 'none',
  } as CSSProperties;

  const newItemProps: Partial<DOMAttributes<FocusableElement>> = {
    ...itemProps,
    style: newItemPropsStyle,
  };

  return newItemProps as DOMAttributes<FocusableElement>;
}
