'use client';

import type { Participant } from '@character-tech/client-common/src/types/app-api';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export interface AuthContextType {
  user: Participant | null;
  isLoading: boolean;
  token: string;
  isPlusUser: boolean;
}

export const useAuth = () => useContext(AuthContext);
