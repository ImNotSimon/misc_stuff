import type { VariantProps } from 'tailwind-variants';

import {
  collapseAdjacentVariantBorders,
  colorVariants,
  dataFocusVisibleClasses,
} from '../utils';
import { tv } from '../utils/tv';

/**
 * Button wrapper **Tailwind Variants** component
 *
 * const classNames = button({...})
 *
 * @example
 * <button
 *  className={classNames())}
 *  data-pressed={true/false}
 *  data-hover={true/false}
 *  data-focus={true/false}
 *  data-focus-visible={true/false}
 * >
 *   Button
 * </button>
 */
const button = tv({
  base: [
    'z-0',
    'group',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'box-border',
    'appearance-none',
    'outline-none',
    'select-none',
    'whitespace-nowrap',
    'min-w-max',
    'font-normal',
    'subpixel-antialiased',
    'overflow-hidden',
    'tap-highlight-transparent',
    // focus ring
    ...dataFocusVisibleClasses,
  ],
  variants: {
    variant: {
      primary: 'bg-primary hover:bg-primary/90',
      outline: 'border-medium bg-transparent hover:bg-accent',
      ghost: 'bg-transparent hover:bg-accent',
    },
    size: {
      sm: 'px-unit-3 min-w-unit-16 h-unit-8 text-tiny gap-unit-2 rounded-sm',
      md: 'px-unit-4 min-w-unit-20 h-unit-10 text-small gap-unit-2 rounded-md',
      lg: 'px-unit-6 min-w-unit-24 h-unit-12 text-medium gap-unit-3 rounded-lg',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    fullWidth: {
      true: 'w-full',
    },
    fullHeight: {
      true: 'h-full',
    },
    isDisabled: {
      true: 'opacity-disabled pointer-events-none',
    },
    isInGroup: {
      true: '[&:not(:first-child):not(:last-child)]:rounded-none',
    },
    isIconOnly: {
      true: 'px-unit-0 !gap-unit-0',
      false: '[&>svg]:max-w-[theme(spacing.unit-8)]',
    },
    disableAnimation: {
      true: '!transition-none',
      false:
        'data-[pressed=true]:scale-[0.97] transition-transform-colors-opacity motion-reduce:transition-none',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
    color: 'primary',
    fullWidth: false,
    isDisabled: false,
    isInGroup: false,
    disableAnimation: false,
  },
  compoundVariants: [
    // solid / color
    {
      variant: 'primary',
      color: 'primary',
      class: colorVariants.primary.primary,
    },
    {
      variant: 'primary',
      color: 'secondary',
      class: colorVariants.primary.secondary,
    },
    {
      variant: 'primary',
      color: 'success',
      class: colorVariants.primary.success,
    },
    {
      variant: 'primary',
      color: 'warning',
      class: colorVariants.primary.warning,
    },
    {
      variant: 'primary',
      color: 'danger',
      class: colorVariants.primary.danger,
    },
    // outline / color
    {
      variant: 'outline',
      color: 'primary',
      class: colorVariants.outline.primary,
    },
    {
      variant: 'outline',
      color: 'secondary',
      class: colorVariants.outline.secondary,
    },
    {
      variant: 'outline',
      color: 'success',
      class: colorVariants.outline.success,
    },
    {
      variant: 'outline',
      color: 'warning',
      class: colorVariants.outline.warning,
    },
    {
      variant: 'outline',
      color: 'danger',
      class: colorVariants.outline.danger,
    },
    // ghost / color
    {
      variant: 'ghost',
      color: 'primary',
      class: colorVariants.ghost.primary,
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class: colorVariants.ghost.secondary,
    },
    {
      variant: 'ghost',
      color: 'success',
      class: colorVariants.ghost.success,
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: colorVariants.ghost.warning,
    },
    {
      variant: 'ghost',
      color: 'danger',
      class: colorVariants.ghost.danger,
    },
    // isInGroup / radius / size <-- radius not provided
    {
      isInGroup: true,
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      size: 'sm',
      class: 'rounded-none first:rounded-s-small last:rounded-e-small',
    },
    {
      isInGroup: true,
      size: 'md',
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      size: 'lg',
      class: 'rounded-none first:rounded-s-large last:rounded-e-large',
    },
    {
      isInGroup: true,
      isRounded: true,
      class: 'rounded-none first:rounded-s-full last:rounded-e-full',
    },
    // isInGroup / radius <-- radius provided
    {
      isInGroup: true,
      radius: 'none',
      class: 'rounded-none first:rounded-s-none last:rounded-e-none',
    },
    {
      isInGroup: true,
      radius: 'sm',
      class: 'rounded-none first:rounded-s-small last:rounded-e-small',
    },
    {
      isInGroup: true,
      radius: 'md',
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      radius: 'lg',
      class: 'rounded-none first:rounded-s-large last:rounded-e-large',
    },
    {
      isInGroup: true,
      radius: 'full',
      class: 'rounded-none first:rounded-s-full last:rounded-e-full',
    },
    // isInGroup / outline / ghost
    {
      isInGroup: true,
      variant: ['ghost', 'outline'],
      color: 'primary',
      className: collapseAdjacentVariantBorders.primary,
    },
    {
      isInGroup: true,
      variant: ['ghost', 'outline'],
      color: 'secondary',
      className: collapseAdjacentVariantBorders.secondary,
    },
    {
      isInGroup: true,
      variant: ['ghost', 'outline'],
      color: 'success',
      className: collapseAdjacentVariantBorders.success,
    },
    {
      isInGroup: true,
      variant: ['ghost', 'outline'],
      color: 'warning',
      className: collapseAdjacentVariantBorders.warning,
    },
    {
      isInGroup: true,
      variant: ['ghost', 'outline'],
      color: 'danger',
      className: collapseAdjacentVariantBorders.danger,
    },
    {
      isIconOnly: true,
      size: 'sm',
      class: 'min-w-unit-8 w-unit-8 h-unit-8',
    },
    {
      isIconOnly: true,
      size: 'md',
      class: 'min-w-unit-10 w-unit-10 h-unit-10',
    },
    {
      isIconOnly: true,
      size: 'lg',
      class: 'min-w-unit-12 w-unit-12 h-unit-12',
    },
    // variant / hover
    {
      variant: ['primary', 'outline', 'ghost'],
      class: 'data-[hover=true]:opacity-hover',
    },
  ],
});

// size: {
//   sm: "px-3 h-8 text-small",
//   md: "px-4 h-10 text-medium",
//   lg: "px-6 h-12 text-medium",
// },

/**
 * ButtonGroup wrapper **Tailwind Variants** component
 *
 * const classNames = buttonGroup({...})
 *
 * @example
 * <div role="group" className={classNames())}>
 *   // button elements
 * </div>
 */
const buttonGroup = tv({
  base: 'inline-flex items-center justify-center h-auto',
  variants: {
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export type ButtonGroupVariantProps = VariantProps<typeof buttonGroup>;
export type ButtonVariantProps = VariantProps<typeof button>;

export { button, buttonGroup };
