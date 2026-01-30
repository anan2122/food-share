'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {actualTheme === 'dark' ? (
          <Moon size={20} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun size={20} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => {
              setTheme('light');
              setShowMenu(false);
            }}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'light' ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Sun size={16} />
            Light
          </button>
          <button
            onClick={() => {
              setTheme('dark');
              setShowMenu(false);
            }}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'dark' ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            onClick={() => {
              setTheme('system');
              setShowMenu(false);
            }}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'system' ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Monitor size={16} />
            System
          </button>
        </div>
      )}
    </div>
  );
}
