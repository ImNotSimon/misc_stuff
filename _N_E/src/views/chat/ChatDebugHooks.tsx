import {
  setDebugMode,
  setModelServerURL,
} from '@character-tech/client-common/src/lib/axiosConstants';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const useChatDebugHooks = () => {
  const searchParams = useSearchParams();
  const modelServerOverride = searchParams?.get('model_server_address');
  useEffect(() => {
    if (modelServerOverride) {
      console.warn('Setting model server override', modelServerOverride);
      setDebugMode(true);
      // this should be server gated to staff only
      setModelServerURL(modelServerOverride);
    }
  }, [modelServerOverride]);
};
