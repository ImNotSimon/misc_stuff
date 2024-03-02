import { logError } from '@/analytics/analytics';
import { CircularProgress } from '@nextui-org/react';
import { type Control, type FieldValues } from 'react-hook-form';
import { type ZodStringCheck } from 'zod';
import { type GenerateFieldParams } from '../Character/CharacterEditor/types';
import { type DynamicTooltipProps } from './DynamicTooltip';
import { RotateIcon } from './Icon';
import { Button } from './button';
import {
  FormControl,
  FormField,
  FormItem,
  convertSchemaChecksToRules,
} from './form';
import { Textarea } from './textarea';
import { cn } from './util/utils';

type FormTextareaFieldProps = {
  control?: Control<FieldValues>;
  name: keyof FieldValues;
  checks: ZodStringCheck[];
  tooltipProps?: DynamicTooltipProps;
  label?: string;
  placeholder?: string;
  className?: string;
  generateFieldProps?: {
    onGenerate: ({ onSuccess, onError }: GenerateFieldParams) => void;
    isLoading: boolean;
  };
  labelEndContent?: React.ReactNode;
  labelPosition?: 'floating' | 'top';
};

export function FormTextareaField({
  name,
  checks,
  label,
  placeholder,
  className,
  tooltipProps,
  generateFieldProps,
  labelEndContent,
  labelPosition = 'floating',
}: FormTextareaFieldProps) {
  return (
    <FormField
      name={name}
      rules={convertSchemaChecksToRules(checks)}
      render={({ field }) => (
        <div className="relative">
          <FormItem>
            <FormControl>
              <Textarea
                className={cn(
                  'bg-surface-elevation-3 focus-visible:border-primary',
                  className,
                )}
                {...field}
                label={label}
                value={
                  typeof field.value !== 'string'
                    ? field.value.toString()
                    : field.value
                }
                placeholder={placeholder}
                disabled={generateFieldProps?.isLoading || field.disabled}
                tooltipProps={tooltipProps}
                labelPosition={labelPosition}
                labelEndContent={labelEndContent}
              />
            </FormControl>
          </FormItem>
          {!!generateFieldProps && (
            <Button
              variant="ghost"
              spinnerSize="xs"
              className={cn(
                'rounded-full p-1 absolute top-0 right-0 bg-accent h-5 w-5 min-w-5 mt-1 mr-1',
                { 'top-[31px] right-[2px]': labelPosition === 'top' },
              )}
              isIconOnly
              isLoading={generateFieldProps.isLoading}
              disabled={generateFieldProps.isLoading}
              onPress={() => {
                generateFieldProps.onGenerate({
                  onSuccess: (result) => {
                    if (result?.[0]?.text) {
                      field.onChange(result[0].text);
                    } else {
                      logError('Content generation result missing data');
                    }
                  },
                  onError: (error) => {
                    logError('Failed to update form text field', {
                      error,
                    });
                  },
                });
              }}
            >
              {generateFieldProps.isLoading ? (
                // xs loading states currently not supported
                <CircularProgress />
              ) : (
                <RotateIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
    />
  );
}
