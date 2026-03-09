'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AccessibilityContextType {
  colorblindMode: boolean;
  toggleColorblindMode: () => void;
  reducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  colorblindMode: false,
  toggleColorblindMode: () => {},
  reducedMotion: false,
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [colorblindMode, setColorblindMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('omi_colorblind') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleColorblindMode = () => {
    setColorblindMode((prev) => {
      localStorage.setItem('omi_colorblind', String(!prev));
      return !prev;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ colorblindMode, toggleColorblindMode, reducedMotion }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/** Returns a pattern marker for colorblind mode */
export function getSuitPattern(suit: string): string {
  switch (suit) {
    case 'hearts': return '●';    // filled circle
    case 'diamonds': return '◆';  // filled diamond
    case 'clubs': return '✦';     // four-point star
    case 'spades': return '▲';    // filled triangle
    default: return '';
  }
}
