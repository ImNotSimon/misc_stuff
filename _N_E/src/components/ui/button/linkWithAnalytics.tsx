import { logAnalyticsEvent, type AnalyticsProps } from '@/analytics/analytics';
import Link, { type LinkProps } from 'next/link';
import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';

interface LinkWithAnalyticsProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    LinkProps {
  analyticsProps?: AnalyticsProps;
  children: ReactNode;
}

const LinkWithAnalytics = ({
  analyticsProps,
  children,
  href,
  ...rest
}: LinkWithAnalyticsProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (analyticsProps) {
      logAnalyticsEvent(analyticsProps.eventName, analyticsProps.properties);
    }

    if (rest.onClick) {
      rest.onClick(e);
    }
  };

  return (
    <Link href={href} passHref legacyBehavior>
      <a {...rest} onClick={handleClick}>
        {children}
      </a>
    </Link>
  );
};

export default LinkWithAnalytics;
