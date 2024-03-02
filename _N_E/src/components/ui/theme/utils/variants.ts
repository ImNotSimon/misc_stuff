const primary = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-foreground hover:bg-accent',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  foreground: 'bg-foreground text-background',
};

const outline = {
  primary: 'bg-outline border-border-outline border-1 text-primary',
  secondary: 'bg-outline border-secondary text-secondary-foreground',
  success: 'bg-outline border-success text-success',
  warning: 'bg-outline border-warning text-warning',
  danger: 'bg-outline border-danger text-danger',
  foreground: 'bg-outline border-foreground text-foreground',
};

const ghost = {
  primary: 'bg-ghost text-primary',
  secondary: 'bg-ghost text-secondary-foreground',
  success: 'bg-ghost text-success',
  warning: 'bg-ghost text-warning',
  danger: 'bg-ghost text-danger',
  foreground: 'bg-ghost text-foreground',
};

export const colorVariants = {
  primary,
  outline,
  ghost,
};
