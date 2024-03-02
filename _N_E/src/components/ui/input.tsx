import * as React from 'react';

import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/stringUtils';
import { t } from 'i18next';
import { DynamicTooltip, type DynamicTooltipProps } from './DynamicTooltip';
import { FormLabel, useMaybeFormField } from './form';
import { getLabelColor } from './helpers';
import { Label } from './label';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    label?: string;
    error?: string;
    tooltipProps?: DynamicTooltipProps;
    labelClassname?: string;
    labelPosition?: 'floating' | 'top';
  }
>(
  (
    {
      className,
      type,
      label,
      error: errorArg,
      tooltipProps,
      labelClassname,
      labelPosition = 'floating',
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);
    const formField = useMaybeFormField();
    const { name, error } = formField ?? { name: '', error: errorArg };
    const tName =
      label ??
      (name
        ? t(`Form.labels.${name}`, { defaultValue: capitalize(name) })
        : '');

    const renderLabelComp = () => {
      const Comp = formField ? FormLabel : Label;
      const renderStylizedComp = () => (
        <Comp
          className={cn(
            labelPosition === 'floating'
              ? 'absolute top-2 left-3 text-sm font-medium floating-label transition-all ease-in-out pointer-events-none'
              : 'decoration-dotted decoration-placeholder hover:decoration-foreground underline-offset-4',
            labelPosition === 'floating'
              ? getLabelColor({ error, focused })
              : 'text-primary',
            {
              'text-md top-5': empty,
              underline: tooltipProps,
            },
            labelClassname,
          )}
        >
          {tName}
        </Comp>
      );

      if (!tName) {
        return null;
      }
      if (!tooltipProps) {
        return renderStylizedComp();
      }
      return (
        <DynamicTooltip {...tooltipProps}>
          {renderStylizedComp()}
        </DynamicTooltip>
      );
    };

    const empty =
      !props.value &&
      !props.defaultValue &&
      !props.placeholder &&
      !focused &&
      type !== 'date';
    const errorMessage = typeof error === 'string' ? error : error?.message;

    const ruleMaxLength = formField?.maxLength?.valueOf();
    const maxLength =
      typeof ruleMaxLength === 'number' ? ruleMaxLength : undefined;

    return (
      <div className="relative w-full flex flex-col">
        {renderLabelComp()}
        <input
          type={type}
          maxLength={maxLength}
          className={cn(
            'flex w-full border bg-background rounded-spacing-s px-3 py-4 text-md file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-placeholder outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            error ? 'border-error' : 'border-input',
            {
              'pb-[15px] pt-[23px]': tName,
              'placeholder:text-md': !!formField,
              'min-h-14 min-w-52': !!tName && type === 'date', // Safari fixes
              'py-3 mt-2': labelPosition === 'top',
            },
            className,
          )}
          ref={ref}
          autoComplete="off"
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {!!errorMessage && (
          <p className="text-error text-sm px-3 mt-1">{errorMessage}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
