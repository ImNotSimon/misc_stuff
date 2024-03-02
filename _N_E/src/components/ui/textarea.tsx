'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/stringUtils';
import { t } from 'i18next';
import { useEffect } from 'react';
import { DynamicTooltip, type DynamicTooltipProps } from './DynamicTooltip';
import { FormLabel, useMaybeFormField } from './form';
import { getLabelColor } from './helpers';
import { Label } from './label';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & {
    chatMode?: boolean;
    label?: string;
    error?: string;
    tooltipProps?: DynamicTooltipProps;
    labelEndContent?: React.ReactNode;
    labelPosition?: 'floating' | 'top';
  }
>(
  (
    {
      className,
      chatMode,
      label,
      error: errorArg,
      tooltipProps,
      labelEndContent,
      labelPosition = 'floating',
      ...props
    },
    ref,
  ) => {
    const initialHeight = React.useRef('');
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>();
    const [focused, setFocused] = React.useState(false);
    const formField = useMaybeFormField();
    const { name, error } = formField ?? { name: '', error: errorArg };
    const tName =
      label ??
      (name
        ? t(`Form.labels.${name}`, { defaultValue: capitalize(name) })
        : '');

    useEffect(() => {
      if (textAreaRef.current && !initialHeight.current) {
        // store the initial height
        initialHeight.current = textAreaRef.current.style.height;
      }
    }, []);

    React.useEffect(() => {
      if (textAreaRef.current) {
        // if the value is empty, reset the height to the initial height
        if (props.value === '') {
          textAreaRef.current.style.height = initialHeight.current;
        } else {
          // otherwise, set the height to the scroll height
          const { scrollHeight } = textAreaRef.current;
          // Textareas by default have a 2px border, except the chat input field.
          const newHeight = scrollHeight + (chatMode ? 0 : 2);
          textAreaRef.current.style.height = `${newHeight}px`;
        }
      }
    }, [chatMode, props.value]);

    const renderLabelComp = () => {
      const Comp = formField ? FormLabel : Label;
      const renderStylizedComp = () => (
        <span
          className={cn('h-fit -mb-1', {
            'flex flex-row justify-between': !!labelEndContent,
          })}
        >
          <Comp
            className={cn(
              labelPosition === 'floating'
                ? 'absolute top-2 left-3 floating-label transition-all ease-in-out text-sm font-medium pointer-events-none'
                : 'decoration-dotted decoration-placeholder hover:decoration-foreground underline-offset-4',
              labelPosition === 'floating'
                ? getLabelColor({ error, focused })
                : 'text-primary',
              {
                'text-md top-5': empty,

                underline: tooltipProps,
              },
            )}
          >
            {tName}
          </Comp>
          {!!labelEndContent && labelEndContent}
        </span>
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
      !props.value && !props.defaultValue && !props.placeholder && !focused;
    const errorMessage = typeof error === 'string' ? error : error?.message;

    const ruleMaxLength = formField?.maxLength?.valueOf();
    const maxLength =
      typeof ruleMaxLength === 'number' ? ruleMaxLength : undefined;

    return (
      <div className="w-full relative flex flex-col">
        {renderLabelComp()}
        <textarea
          maxLength={maxLength}
          className={cn(
            'flex max-h-96 px-3 py-4 w-full border bg-background text-md file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-50 resize-none focus-visible:outline-none',
            error ? 'border-error' : 'border-input',
            {
              'h-10 py-2': chatMode,
              'rounded-spacing-s': !chatMode,
              'pb-[15px] pt-[23px]': tName,
              'placeholder:text-md': !!formField,
              'py-3 mt-2': labelPosition === 'top',
            },
            className,
          )}
          ref={combineRefs(textAreaRef, ref)}
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
Textarea.displayName = 'Textarea';

export { Textarea };

// helper to combine the local ref with the forwarded ref
const combineRefs =
  (
    localRef: React.MutableRefObject<HTMLTextAreaElement | null | undefined>,
    forwardedRef: React.ForwardedRef<HTMLTextAreaElement>,
  ) =>
  (element: HTMLTextAreaElement | null) => {
    // Assign to localRef
    // eslint-disable-next-line no-param-reassign
    localRef.current = element;

    // Assign to forwardedRef
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = element;
    }
  };
