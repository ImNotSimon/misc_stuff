import { ClientEnv } from '@/env/client.mjs';
import { setupAxios as setupClientCommonAxios } from '@character-tech/client-common/src/lib/axios';
import axios from 'axios';

export const setupAxios = (token?: string) => {
  axios.defaults.baseURL = ClientEnv.NEXT_PUBLIC_CHAR_SERVER_URL;
  axios.defaults.timeout = 50000;

  axios.defaults.headers.common.Authorization = token ? `Token ${token}` : '';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  setupClientCommonAxios(() => axios);
};

export const getAxiosInstance = () => axios;
