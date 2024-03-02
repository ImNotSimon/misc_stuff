import { cn } from '@/lib/utils';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { LuChevronsUpDown } from 'react-icons/lu';
import { DynamicDropdownMenu } from './DynamicDropdownMenu';
import { Button } from './button';
import { FormField, FormItem } from './form';
import { type ContextItem } from './ui-types';

type EnumType = { [id: string]: string };

type FormEnumButtonsFieldProps = {
  name: keyof FieldValues;
  label: string;
  fieldEnumProps: {
    [K in keyof EnumType]: {
      label: string;
      icon: React.ReactNode;
      details: string;
    };
  };
};

const EnumOption = ({
  isActive,
  label,
  icon,
  details,
  onChange,
}: {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  details: string;
  onChange?: () => void;
}) => (
  <Button
    key={label}
    variant="ghost"
    onPress={onChange}
    className={cn(
      'h-fit flex flex-col gap-1 p-2 items-start rounded-spacing-xs',
      { 'bg-surface-elevation-3': isActive },
    )}
  >
    <div className="text-md flex flex-row gap-1 items-center">
      {icon}
      {label}
    </div>
    <div className="w-full h-fit text-left flex justify-start text-muted-foreground whitespace-normal overflow-wrap break-words">
      {details}
    </div>
  </Button>
);

export const FormEnumButtonsFieldCore = ({
  fieldValue,
  fieldOnChange,
  fieldEnumProps,
  setIsOpen,
  isOpen,
  label,
}: {
  fieldValue: string;
  fieldOnChange: (val: string) => void;
  fieldEnumProps: {
    [K in keyof EnumType]: {
      label: string;
      icon: React.ReactNode;
      details: string;
    };
  };
  setIsOpen: (val: boolean) => void;
  isOpen: boolean;
  label: string;
}) => (
  <DynamicDropdownMenu
    options={Object.keys(fieldEnumProps).map((enumValue) => {
      const { label: fieldLabel, icon, details } = fieldEnumProps[enumValue];
      return {
        content: (
          <EnumOption
            isActive={enumValue === fieldValue}
            label={fieldLabel}
            icon={icon}
            details={details}
            onChange={() => {
              fieldOnChange(enumValue);
              setIsOpen(false);
            }}
          />
        ),
        asChild: true,
        key: label,
      } as ContextItem;
    })}
    setIsOpen={setIsOpen}
    isOpen={isOpen}
    triggerClassName="opacity-100"
    itemClassName="w-52"
  >
    <div className="text-md flex flex-row gap-1 items-center border-1 p-2 rounded-spacing-xs border-surface-elevation-3">
      {fieldEnumProps[fieldValue].icon}
      {fieldEnumProps[fieldValue].label}
      <LuChevronsUpDown className="size-4 ml-1" />
    </div>
  </DynamicDropdownMenu>
);

export function FormEnumButtonsField({
  name,
  label,
  fieldEnumProps,
}: FormEnumButtonsFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <p className="mb-2 text-md font-medium">{label}</p>
      <FormField
        name={name}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormEnumButtonsFieldCore
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              label={label}
              fieldEnumProps={fieldEnumProps}
              fieldValue={field.value}
              fieldOnChange={field.onChange}
            />
          </FormItem>
        )}
      />
    </div>
  );
}
