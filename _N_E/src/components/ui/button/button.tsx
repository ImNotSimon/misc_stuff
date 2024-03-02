import { logAnalyticsEvent, type AnalyticsProps } from '@/analytics/analytics';
import {
  useButton,
  type UseButtonProps,
} from '@/components/ui/button/useButton';
import { Ripple } from '@/components/ui/ripple';
import Spinner, { type SpinnerProps } from '@/components/ui/spinner/spinner';
import { forwardRef } from '@/components/ui/util/utils';
import { type PressEvent } from '@react-types/shared';
import { type MouseEvent } from 'react';
import { isMobile } from 'react-device-detect';

export type ButtonProps = Omit<UseButtonProps, 'onClick'> & {
  /**
   * spinnerSize override
   */
  spinnerSize?: SpinnerProps['size'];
  /**
   * @deprecated The `onClick` handler is deprecated. Use `onPress` instead.
   */
  onClick?: UseButtonProps['onClick'];
  /**
   * properties which will be recorded on press of button
   */
  analyticsProps?: AnalyticsProps;
  /**
   * Disables default action on click events.
   * Useful if a button is inside a link, and shouldn't trigger link.
   */
  preventDefault?: boolean;
};

const Button = forwardRef<'button', ButtonProps>((props, ref) => {
  const {
    Component,
    domRef,
    children,
    styles,
    spinnerSize,
    spinner = (
      <Spinner color="current" size={props.spinnerSize ?? spinnerSize} />
    ),
    spinnerPlacement,
    startContent,
    endContent,
    isLoading,
    disableRipple = isMobile,
    getButtonProps,
    getRippleProps,
    isIconOnly,
  } = useButton({ ...props, ref });

  const handleButtonClick = (event: MouseEvent) => {
    if (props.preventDefault) event.preventDefault();

    event.stopPropagation();
  };

  const handleButtonPress = (event: PressEvent) => {
    if (props?.analyticsProps) {
      logAnalyticsEvent(
        props.analyticsProps.eventName,
        props.analyticsProps.properties,
      );
    }

    if (props.onPress) {
      props.onPress(event);
    }
  };

  const buttonProps = {
    ...getButtonProps(),
    onClick: handleButtonClick,
    onPress: handleButtonPress,
  };

  return (
    <Component ref={domRef} className={styles} {...buttonProps}>
      {startContent}
      {!!isLoading && spinnerPlacement === 'start' && spinner}
      {isLoading && isIconOnly ? null : children}
      {!!isLoading && spinnerPlacement === 'end' && spinner}
      {endContent}
      {!disableRipple && <Ripple {...getRippleProps()} />}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;
