import { type ContextType } from '@/components/ui/button/useButtonGroup';
import { createContext } from '@/components/ui/util/context';

export const [ButtonGroupProvider, useButtonGroupContext] =
  createContext<ContextType>({
    name: 'ButtonGroupContext',
    strict: false,
  });
