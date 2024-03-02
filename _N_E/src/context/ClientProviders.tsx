'use client';

import { DynamicTooltipProvider } from '@/components/ui/DynamicTooltip';
import { Toaster } from '@/components/ui/toaster';
import { ClientEnv } from '@/env/client.mjs';
import '@/i18n/config';
import { chatStyleSignal } from '@/lib/state/signals';
import { COOKIE_CHAT_STYLE, type ChatStyle } from '@/utils/constants';
import { setNeoHost } from '@character-tech/client-common/src/lib/axiosConstants';
import { NextUIProvider } from '@nextui-org/react';
import Cookies from 'js-cookie';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  setNeoHost(ClientEnv.NEXT_PUBLIC_NEO_HOST_BASE);
  useEffect(() => {
    if (Cookies.get(COOKIE_CHAT_STYLE)) {
      chatStyleSignal.value = Cookies.get(COOKIE_CHAT_STYLE) as ChatStyle;
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <NextUIProvider navigate={router.push}>
        <div className="bg-background">
          <Toaster />
          <DynamicTooltipProvider>{children}</DynamicTooltipProvider>
        </div>
      </NextUIProvider>
    </ThemeProvider>
  );
}
