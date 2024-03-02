import { SCREEN_LG, SCREEN_MD, SCREEN_SM } from '@/utils/constants';
import { useMedia } from 'react-use';

export const useIsSmallScreen = () => useMedia(`(max-width: ${SCREEN_SM}px)`);

export const useIsLargeScreen = () => useMedia(`(min-width: ${SCREEN_LG}px)`);

export const useIsMediumScreen = () => useMedia(`(min-width: ${SCREEN_MD}px)`);
