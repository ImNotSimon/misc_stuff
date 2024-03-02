import { ButtonGroupProvider } from '@/components/ui/button/buttonGroupContext';
import {
  useButtonGroup,
  type UseButtonGroupProps,
} from '@/components/ui/button/useButtonGroup';
import { forwardRef } from '@/components/ui/util/utils';

export type ButtonGroupProps = UseButtonGroupProps;

const ButtonGroup = forwardRef<'div', ButtonGroupProps>((props, ref) => {
  const {
    Component,
    domRef,
    context,
    children,
    classNames,
    getButtonGroupProps,
  } = useButtonGroup({
    ...props,
    ref,
  });

  return (
    <ButtonGroupProvider value={context}>
      <Component ref={domRef} className={classNames} {...getButtonGroupProps()}>
        {children}
      </Component>
    </ButtonGroupProvider>
  );
});

ButtonGroup.displayName = 'NextUI.ButtonGroup';

export default ButtonGroup;
