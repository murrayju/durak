// @flow
import { useContext, useEffect, useState, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

import AppContext from '../contexts/AppContext';

const useEventSource = (
  url: string,
  initializeFn: (es: EventSourcePolyfill) => void,
  deps?: any[] = [],
) => {
  const context = useContext(AppContext);
  const { getUser } = context;
  const [esConnected, setEsConnected] = useState(false);

  const initFn = useCallback(initializeFn, deps);

  useEffect(() => {
    const es = new EventSourcePolyfill(url);

    es.addEventListener('open', () => {
      setEsConnected(true);
    }); // fired by server when registration completed

    es.addEventListener('connected', () => {
      setEsConnected(true);
    }); // fired by server just before closing

    es.addEventListener('connectionClosing', () => {
      setEsConnected(false);
    });

    es.addEventListener('error', err => {
      console.error('EventListener error', err);
      setEsConnected(false);
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
  }, [initFn, getUser, url]);

  return esConnected;
};

export default useEventSource;
