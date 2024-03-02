import { initializeApp } from 'firebase/app';
import {
  ReCaptchaEnterpriseProvider,
  initializeAppCheck,
} from 'firebase/app-check';
import {
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type NextOrObserver,
  type User,
} from 'firebase/auth';
import { config, getFirebaseConfig } from './firebaseConfig';

export const initFirebase = () => {
  const app = initializeApp(getFirebaseConfig());

  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(config.reCaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  const auth = getAuth(appCheck.app);

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  const signInWithGoogle = () => signInWithPopup(auth, googleAuthProvider);

  const signInWithGoogleCredential = async (token: string) => {
    const credential = GoogleAuthProvider.credential(token);
    return signInWithCredential(auth, credential);
  };

  const appleAuthProvider = new OAuthProvider('apple.com');
  appleAuthProvider.addScope('name');
  appleAuthProvider.addScope('email');

  const signInWithApple = () => signInWithPopup(auth, appleAuthProvider);

  const sendSignInWithEmail = async (email: string) => {
    window.localStorage.setItem('emailForSignIn', email);
    return sendSignInLinkToEmail(auth, email, {
      url: `${window.location.origin}`,
      handleCodeInApp: true,
    });
  };

  const signInWithLink = async (email: string, href: string) =>
    signInWithEmailLink(auth, email, href);

  const userStateListener = (callback: NextOrObserver<User>) =>
    onAuthStateChanged(auth, callback);

  const isSignInWithPasswordless = (href: string) =>
    isSignInWithEmailLink(auth, href);

  const signOutUser = async () => signOut(auth);

  return {
    signInWithGoogle,
    signInWithGoogleCredential,
    signInWithApple,
    sendSignInWithEmail,
    signInWithLink,
    userStateListener,
    isSignInWithPasswordless,
    signOutUser,
  };
};
