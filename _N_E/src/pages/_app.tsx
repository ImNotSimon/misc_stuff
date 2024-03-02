/* eslint-disable react/function-component-definition */
/* eslint-disable i18next/no-literal-string */
import '@/components/ui/avatar.css';
import '@/components/ui/typingIndicator.css';
import ClientProviders from '@/context/ClientProviders';
import { cn } from '@/lib/utils';
import '@/setup/zodErrors';
import '@/styles/backgroundGradient.css';
import '@/styles/cardEffect.css';
import '@/styles/globals.css';
import '@/styles/homeShelves.css';
import '@/styles/hyperspace.css';
import '@/styles/Loader.css';
import '@/styles/rainbowGlow.css';
import '@/styles/signedOut.css';
import '@/styles/typingEffect.css';
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { UnauthenticatedHomeRedirect } from '@/components/Common/UnauthenticatedHome';
import { RootLayout, SignedOutRootLayout } from '@/context/RootLayout';
import { guideOpenSignal } from '@/lib/state/signals';
import Signup from '@/pages/signup';
import { api } from '@/utils/api';
import { type NextPage } from 'next';
import type { AppProps } from 'next/app';
import { Inter, Onest } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import NextNProgress from 'nextjs-progressbar';
import { useEffect, type ReactElement, type ReactNode } from 'react';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false,
});

export const runtime = 'experimental-edge';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SignedOut?: (pageProps: any) => ReactNode;
  hideGuide?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = async (_events: Event[]) => {
      if (guideOpenSignal.value === 'mobile') {
        guideOpenSignal.value = 'closed';
      }

      const result = await fetch('/api/ping', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((r) => r.json());

      if (result.status && result.status === 'OK') {
        return;
      }

      // trigger full reload so that user hits the WR
      window.location.reload();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  let component = null;
  const isAuthed = !!pageProps.user;
  const isIncompleteSignup =
    isAuthed && !pageProps.user.user?.account?.onboarding_complete;
  if (isAuthed) {
    if (isIncompleteSignup) {
      component = <Signup {...pageProps} />;
    } else {
      component = getLayout(<Component {...pageProps} />);
    }
  } else {
    const MaybeSignedout = Component.SignedOut;
    component = MaybeSignedout ? (
      getLayout(<MaybeSignedout {...pageProps} />)
    ) : (
      <UnauthenticatedHomeRedirect {...pageProps} />
    );
  }

  // special case to return the error component if we had an error
  if (Object.keys(pageProps).includes('statusCode')) {
    return (
      <SignedOutRootLayout {...pageProps}>{component}</SignedOutRootLayout>
    );
  }

  const Layout = isAuthed ? RootLayout : SignedOutRootLayout;

  return (
    <ClientProviders>
      {/* Appsflyer */}
      <Script
        id="appsflyer-banners-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
              (t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
              t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
              o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
              p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","pba,banners",{pba: {webAppId: "31d4ac89-b721-42f9-bc8c-56e0c68b2a62"}, banners: {key: "81ac37f8-7426-400d-8715-e952503db2a5"}});
            `,
        }}
      />
      {/* End Appsflyer */}
      <style jsx global>
        {`
          :root {
            --inter-font: ${inter.style.fontFamily};
            font-family: ${onest.style.fontFamily};
          }
        `}
      </style>
      <Head>
        <title>c.ai</title>
        <meta name="description" content="AI that is always there for you" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <main className={`h-full ${cn(onest.className)}`}>
        <NextNProgress
          height={2}
          options={{
            showSpinner: false,
          }}
        />
        <Layout
          hideGuide={Component.hideGuide || isIncompleteSignup}
          {...pageProps}
        >
          {component}
        </Layout>
      </main>
    </ClientProviders>
  );
}

export default api.withTRPC(App);
