// @flow
import { useState, useEffect } from 'react';

const useTimer = (interval?: number = 1000) => {
  const [startTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [tick, setTick] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const handle = setInterval(() => {
      setTick((t) => t + 1);
      const now = new Date();
      setDate(now);
      setElapsedTime(now - startTime);
    }, interval);
    return () => {
      clearInterval(handle);
    };
  }, [interval, startTime]);

  return {
    tick,
    startTime,
    elapsedTime,
    date,
  };
};

export default useTimer;
