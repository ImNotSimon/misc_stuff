import { type FieldValues } from 'react-hook-form';
import { Checkbox } from './Checkbox';
import { FormField, FormItem } from './form';
import { cn } from './util/utils';

type FormCheckboxFieldProps = {
  name: keyof FieldValues;
  label?: string;
  isReversed?: boolean;
};

export function FormCheckboxField({
  name,
  label,
  isReversed,
}: FormCheckboxFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        const fieldValue = isReversed ? !field.value : Boolean(field.value);

        return (
          <FormItem className="flex items-center gap-2">
            <Checkbox
              className="bg-surface-elevation-3 mt-2"
              {...field}
              checked={fieldValue}
              onCheckedChange={() => field.onChange(!field.value)}
            />
            <div
              onClick={() => !field.disabled && field.onChange(!field.value)}
            >
              <label
                htmlFor={field.name}
                className={cn(
                  field.disabled
                    ? 'text-muted-foreground'
                    : 'hover:cursor-pointer',
                )}
              >
                {label}
              </label>
            </div>
          </FormItem>
        );
      }}
    />
  );
}
