'use client';

import '@/setup/clientCommon';

import type { ReactNode } from 'react';

// eslint-disable-next-line react/function-component-definition
export const UseQueryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => <div>{children}</div>;
