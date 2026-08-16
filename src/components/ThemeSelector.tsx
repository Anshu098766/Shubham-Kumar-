import React from 'react';
import { THEME_LIST } from '../data/themes';
import { ThemeId } from '../types';
import { sound } from '../utils/audio';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  return (
    <div id="theme-selector-section" className="w-full flex items-center justify-between py-2 px-1 gap-2">
      <span className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-400 uppercase font-rajdhani">
        THEME:
      </span>
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap max-w-full">
        {THEME_LIST.map((t) => {
          const isSelected = currentTheme === t.id;
          return (
            <button
              key={t.id}
              id={`theme-btn-${t.id}`}
              title={t.name}
              onClick={() => {
                sound.playClick();
                onSelectTheme(t.id);
              }}
              className={`relative rounded-full transition-all duration-300 flex items-center justify-center p-0.5 focus:outline-none ${
                isSelected ? 'scale-115' : 'hover:scale-110 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Outer halo ring for selected theme */}
              {isSelected && (
                <span
                  className="absolute -inset-1 rounded-full animate-pulse opacity-80"
                  style={{
                    border: `2px solid ${t.primary}`,
                    boxShadow: `0 0 10px ${t.primary}`,
                  }}
                />
              )}

              {/* Color circle */}
              <span
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full block transition-transform shadow-inner"
                style={{
                  backgroundColor: t.dotColor,
                  boxShadow: isSelected
                    ? `0 0 8px ${t.primary}, inset 0 0 4px rgba(255,255,255,0.6)`
                    : 'inset 0 0 2px rgba(0,0,0,0.5)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
