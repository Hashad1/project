import React from 'react';
import { translations } from '../../utils/translations';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ChatHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 py-6 px-8">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleTheme}
          className="absolute left-8 top-8 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDark ? translations.lightMode : translations.darkMode}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <img 
              src="/rcj-logo.svg" 
              alt="الهيئة الملكية بالجبيل"
              className="w-full h-full"
              style={{ objectFit: 'contain', aspectRatio: '1/1' }}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              المستشار الذكي للهيئة الملكية بالجبيل
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{translations.alwaysHereToHelp}</p>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-orange-500 to-purple-500 opacity-75" />
    </div>
  );
}