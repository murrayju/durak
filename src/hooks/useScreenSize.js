// @flow
import { useState, useEffect, useCallback } from 'react';

const useScreenSize = () => {
  const hasScreen = typeof window === 'object';

  const getScreenSize = useCallback(() => {
    return {
      width: hasScreen ? window.innerWidth : 0,
      height: hasScreen ? window.innerHeight : 0,
    };
  }, [hasScreen]);

  const [screenSize, setScreenSize] = useState(getScreenSize);

  useEffect(() => {
    if (!hasScreen) return false;
    const resize = () => {
      setScreenSize(getScreenSize());
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [hasScreen, getScreenSize]);

  return screenSize;
};

export default useScreenSize;
