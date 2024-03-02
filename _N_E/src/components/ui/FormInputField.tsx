import { cn } from '@/lib/utils';
import { type Control, type FieldValues } from 'react-hook-form';
import { type ZodStringCheck } from 'zod';
import { type DynamicTooltipProps } from './DynamicTooltip';
import {
  FormControl,
  FormField,
  FormItem,
  convertSchemaChecksToRules,
} from './form';
import { Input } from './input';

type FormInputFieldProps = {
  control?: Control<FieldValues>;
  name: keyof FieldValues;
  checks: ZodStringCheck[];
  label?: string;
  placeholder?: string;
  className?: string;
  type?: string;
  tooltipProps?: DynamicTooltipProps;
  labelClassname?: string;
  labelPosition?: 'floating' | 'top';
};

export function FormInputField({
  name,
  checks,
  label,
  placeholder,
  className,
  tooltipProps,
  labelClassname,
  type = 'text',
  labelPosition = 'floating',
}: FormInputFieldProps) {
  return (
    <FormField
      name={name}
      rules={convertSchemaChecksToRules(checks)}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <Input
              tooltipProps={tooltipProps}
              className={cn(
                'bg-surface-elevation-3 focus-visible:border-primary',
                className,
              )}
              type={type}
              {...field}
              value={
                field.value && typeof field.value !== 'string'
                  ? field.value.toString()
                  : field.value
              }
              label={label}
              placeholder={placeholder}
              labelPosition={labelPosition}
              labelClassname={labelClassname}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
