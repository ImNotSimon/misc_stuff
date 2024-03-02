'use client';

/* eslint-disable i18next/no-literal-string */
import { Footer } from '@/components/Common/Footer';
import SignInButtons from '@/components/Common/SigninButtons';
import { api } from '@/utils/api';
import { initFirebase } from '@/utils/auth/firebase';

import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function UnauthenticatedHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    void router.push('/');
  }, [router]);

  return null;
}

export default function UnauthenticatedHome() {
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToggled(true);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, []);

  const login = api.auth.signIn.useMutation();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      const { credential } = credentialResponse;
      if (credential) {
        const idpCredentials =
          await initFirebase().signInWithGoogleCredential(credential);
        const token = await idpCredentials.user.getIdToken();
        const successfulLogin = await login.mutateAsync({
          googleJwt: token,
        });

        if (successfulLogin) {
          window.location.reload();
        }
      }
    },
    onError: () => {
      console.error('Login Failed');
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-center md:flex-row md:items-end">
            <ul className={`caiTitle flex ${!toggled ? 'toggled' : ''}`}>
              <li>c</li>
              <li className="ghost">h</li>
              <li className="ghost">a</li>
              <li className="ghost">r</li>
              <li className="ghost">a</li>
              <li className="ghost">c</li>
              <li className="ghost">t</li>
              <li className="ghost">e</li>
              <li className="ghost">r</li>
              <li>.</li>
              <li>a</li>
              <li>i</li>
            </ul>
            <div
              className={`taglines opacity-${
                !toggled ? '0' : '100'
              } mb-[2px] ml-2 h-[1em] overflow-hidden`}
            >
              <div className="innerTaglines">
                is always there for you <br />
                helps you get stuff done <br />
                makes you laugh <br />
                makes your life easier <br />
                empowers you <br />
                speak to anyone or anything <br />
                learn new things <br />
                find new friends <br />
                find an AI or create your own AI <br />
                #LifeWithCharacter <br />
              </div>
            </div>
          </div>
          <SignInButtons />
        </div>
      </div>
      <Footer />
    </div>
  );
}
