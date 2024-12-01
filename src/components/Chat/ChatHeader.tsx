import React from 'react';
import { translations } from '../../utils/translations';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ChatHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-4 sm:py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden bg-white p-1">
            <img 
              src="/rcj-logo-new.svg"
              alt="الهيئة الملكية للجبيل وينبع"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              المستشار الذكي
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              الهيئة الملكية للجبيل وينبع
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mr-2 sm:mr-4"
          aria-label={isDark ? translations.lightMode : translations.darkMode}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange-500 to-purple-500 opacity-75" />
    </div>
  );
}