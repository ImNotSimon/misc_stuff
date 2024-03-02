import { DEFAULT_THEME, StorageUtils, ThemeMode } from '@/utils/constants';
import { useTheme } from 'next-themes';
import { Router } from 'next/router';
import { useCallback, useEffect, useState, type RefObject } from 'react';

export const useIsTouchDevice = () => {
  useEffect(() => {
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
    }
  }, []);
  return document.body.classList.contains('touch-device');
};

export const isTouchDevice = () =>
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.maxTouchPoints > 0;

export const useThemeMode = () => {
  const [mode, setMode] = useState(DEFAULT_THEME);
  const { setTheme, systemTheme } = useTheme();

  const handleSetThemeMode = useCallback(
    (thisMode?: ThemeMode, temporary?: boolean) => {
      if (thisMode && !temporary) {
        localStorage.setItem(StorageUtils.Keys.ThemeMode, thisMode);
      }

      if (thisMode === ThemeMode.system) {
        setTheme(systemTheme ?? DEFAULT_THEME);
      } else {
        setTheme(thisMode ?? DEFAULT_THEME);
      }

      setMode(thisMode ?? DEFAULT_THEME);
    },
    [setTheme, systemTheme],
  );

  const resolveThemeMode = useCallback(() => {
    const storedThemeMode = localStorage.getItem(StorageUtils.Keys.ThemeMode);
    handleSetThemeMode(storedThemeMode as ThemeMode | undefined);
  }, [handleSetThemeMode]);

  return { mode, handleSetThemeMode, resolveThemeMode };
};

export const useDisableWheelScrollToNavBrowser = (
  swiperContainerRef: RefObject<HTMLDivElement>,
) => {
  useEffect(() => {
    const swiperContainer = swiperContainerRef.current;
    if (!swiperContainer) return;

    const handleMouseWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const max = swiperContainer.scrollWidth - swiperContainer.offsetWidth;

      if (
        swiperContainer.scrollLeft + e.deltaX < 0 ||
        swiperContainer.scrollLeft + e.deltaX > max
      ) {
        e.preventDefault();
        swiperContainer.scrollLeft = Math.max(
          0,
          Math.min(max, swiperContainer.scrollLeft + e.deltaX),
        );
      }
    };

    swiperContainer.addEventListener('wheel', handleMouseWheel, false);

    return () => {
      if (swiperContainer) {
        swiperContainer.removeEventListener('wheel', handleMouseWheel, false);
      }
    };
  }, [swiperContainerRef]);
};

export const useWarnBeforeLeavePage = (enabled: boolean, message: string) => {
  useEffect(() => {
    // for rereshing the page
    window.onbeforeunload = () => {
      if (enabled) {
        return message;
      }
    };

    // for changing in-app route.
    if (enabled) {
      const routeChangeStart = () => {
        // eslint-disable-next-line no-restricted-globals, no-alert
        const ok = confirm(message);
        if (!ok) {
          Router.events.emit('routeChangeError', '', '', {
            shallow: false,
          });
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'Abort route change. Please ignore this error.';
        }
      };

      Router.events.on('routeChangeStart', routeChangeStart);
      return () => {
        Router.events.off('routeChangeStart', routeChangeStart);
      };
    }
  }, [enabled, message]);
};
