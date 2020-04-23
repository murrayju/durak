// @flow
import { useState, useEffect } from 'react';
import screenFull from 'screenfull';

const useFullScreen = () => {
  const [isFullScreen, setFullScreen] = useState(screenFull.isFullscreen);

  useEffect(() => {
    const callback = () => setFullScreen(screenFull.isFullscreen);
    screenFull.on('change', callback);

    return () => {
      screenFull.off('change', callback);
    };
  }, []);

  return {
    isFullScreen,
    request: (el?: any) => screenFull.request(el),
    exit: () => screenFull.exit(),
    toggle: () => screenFull.toggle(),
  };
};

export default useFullScreen;
