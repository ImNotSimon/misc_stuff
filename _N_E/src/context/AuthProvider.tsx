'use client';

import '@/setup/clientCommon';

import { setupAxios } from '@/lib/axios';
import { isUserPlusMember } from '@/utils/userUtils';
import { SetChatProviderUser } from '@character-tech/client-common/src/chatManager/chatProviderUser';
import { setupAxios as setupClientCommonAxios } from '@character-tech/client-common/src/lib/axios';
import { hiddenCharacters } from '@character-tech/client-common/src/state/signals';
import type { Participant } from '@character-tech/client-common/src/types/app-api';
import axios from 'axios';
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { UseQueryProvider } from './UseQueryProvider';

export interface AuthContextType {
  user: Participant | null;
  token: string;
  isLoading: boolean;
  isPlusUser: boolean;
  setUser: (user: Participant) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  token: '',
  isPlusUser: false,
  setUser: () => {},
});

export const AuthProvider: React.FC<{
  children: ReactNode;
  user: Participant;
  token?: string;
  // eslint-disable-next-line react/function-component-definition
}> = ({ children, user, token = '' }) => {
  setupAxios(token);
  setupClientCommonAxios(() => axios);
  if (user) {
    SetChatProviderUser(user);
  }

  const [localUser, setLocalUser] = useState<Participant>(user);
  const isPlusUser = useMemo(() => isUserPlusMember(user), [user]);

  const providerValue = useMemo(
    () => ({
      user: localUser,
      token,
      isLoading: false,
      setUser: setLocalUser,
      isPlusUser,
    }),
    [localUser, token, isPlusUser],
  );

  useEffect(() => {
    hiddenCharacters.value = user.hidden_characters ?? [];
  }, [user]);

  return (
    <AuthContext.Provider value={providerValue}>
      <UseQueryProvider>{children}</UseQueryProvider>
    </AuthContext.Provider>
  );
};
