'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    // Apply theme on mount
    const theme = localStorage.getItem('satisclient-theme') || 'light';
    const root = document.documentElement;

    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  return null;
}
