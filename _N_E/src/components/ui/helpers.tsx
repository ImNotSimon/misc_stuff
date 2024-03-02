import { type FieldError } from 'react-hook-form';

export const getLabelColor = ({
  error,
  focused,
}: {
  error: string | FieldError | undefined;
  focused: boolean;
}) => {
  if (error) {
    return 'text-error';
  }
  return focused ? 'text-primary' : 'text-muted-foreground';
};
