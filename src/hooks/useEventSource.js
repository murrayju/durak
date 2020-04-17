// @flow
import { useEffect, useState, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

const useEventSource = (
  url: string,
  initializeFn: (es: EventSourcePolyfill) => void,
  deps?: any[] = [],
) => {
  const [connected, setConnected] = useState(false);

  const initFn = useCallback(initializeFn, deps);

  useEffect(() => {
    const es = new EventSourcePolyfill(url);

    es.addEventListener('open', () => {
      setConnected(true);
    }); // fired by server when registration completed

    es.addEventListener('connected', () => {
      setConnected(true);
    }); // fired by server just before closing

    es.addEventListener('connectionClosing', () => {
      setConnected(false);
    });

    es.addEventListener('error', (err) => {
      console.error('EventListener error', err);
      setConnected(false);
    });

    initFn(es);

    // cleanup
    return () => {
      try {
        es.close();
      } catch (err) {
        console.error(`Failed to close EventSource ${url}`, err);
      }
    };
  }, [initFn, url]);

  return connected;
};

export default useEventSource;
