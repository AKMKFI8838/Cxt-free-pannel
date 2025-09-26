
'use client';

import { useState, useEffect, useRef } from 'react';

interface UseIdleTimeoutProps {
  onIdle: () => void;
  idleTime?: number;
}

export const useIdleTimeout = ({ onIdle, idleTime = 15 }: UseIdleTimeoutProps) => {
  const timeoutId = useRef<NodeJS.Timeout>();

  const startTimer = () => {
    timeoutId.current = setTimeout(onIdle, idleTime * 60 * 1000);
  };

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    startTimer();
  };

  const handleEvent = () => {
    resetTimer();
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];

    startTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [idleTime, onIdle]);

  return null;
};
