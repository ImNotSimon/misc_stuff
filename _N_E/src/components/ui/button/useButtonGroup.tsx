import {
  buttonGroup,
  type ButtonGroupVariantProps,
} from '@/components/ui/theme/components/button';
import { useDOMRef } from '@/components/ui/util/dom';
import { type ReactRef } from '@/components/ui/util/refs';
import {
  type HTMLNextUIProps,
  type PropGetter,
} from '@/components/ui/util/types';
import { mapPropsVariants } from '@/components/ui/util/utils';
import { useCallback, useMemo } from 'react';
import type { ButtonProps } from './index';

interface Props extends HTMLNextUIProps, ButtonGroupVariantProps {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLDivElement | null>;
  /**
   * Whether the buttons are disabled.
   * @default false
   */
  isDisabled?: ButtonProps['isDisabled'];
}

export type ContextType = {
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  radius?: ButtonProps['radius'];
  isDisabled?: ButtonProps['isDisabled'];
  disableAnimation?: ButtonProps['disableAnimation'];
  disableRipple?: ButtonProps['disableRipple'];
  isIconOnly?: ButtonProps['isIconOnly'];
  fullWidth?: boolean;
  fullHeight?: boolean;
};

export type UseButtonGroupProps = Props &
  Partial<
    Pick<
      ButtonProps,
      | 'size'
      | 'color'
      | 'radius'
      | 'variant'
      | 'isIconOnly'
      | 'disableAnimation'
      | 'disableRipple'
    >
  >;

export function useButtonGroup(originalProps: UseButtonGroupProps) {
  const [props, variantProps] = mapPropsVariants(
    originalProps,
    buttonGroup.variantKeys,
  );

  const {
    ref,
    as,
    children,
    color = 'primary',
    size = 'md',
    variant = 'primary',
    radius,
    isDisabled = false,
    disableAnimation = false,
    disableRipple = false,
    isIconOnly = false,
    className,
    ...otherProps
  } = props;

  const Component = as || 'div';

  const domRef = useDOMRef(ref);

  const classNames = useMemo(
    () =>
      buttonGroup({
        ...variantProps,
        className,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(variantProps), className],
  );

  const context = useMemo<ContextType>(
    () => ({
      size,
      color,
      variant,
      radius,
      isIconOnly,
      isDisabled,
      disableAnimation,
      disableRipple,
      fullWidth: !!originalProps?.fullWidth,
    }),
    [
      size,
      color,
      variant,
      radius,
      isDisabled,
      isIconOnly,
      disableAnimation,
      disableRipple,
      originalProps?.fullWidth,
    ],
  );

  const getButtonGroupProps: PropGetter = useCallback(
    () => ({
      role: 'group',
      ...otherProps,
    }),
    [otherProps],
  );

  return {
    Component,
    children,
    domRef,
    context,
    classNames,
    getButtonGroupProps,
  };
}

export type UseButtonGroupReturn = ReturnType<typeof useButtonGroup>;
