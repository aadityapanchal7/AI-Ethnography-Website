'use client';

import type { Theme } from '@/lib/types';

interface ThemesPanelProps {
  themes: Theme[];
  selectedThemeId?: string | null;
  onThemeClick: (theme: Theme) => void;
  isLoading?: boolean;
}

export default function ThemesPanel({
  themes,
  selectedThemeId,
  onThemeClick,
  isLoading = false,
}: ThemesPanelProps) {
  const newThemes = themes.filter((t) => t.isNew);
  const emergingThemes = themes.filter((t) => t.isEmerging);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div>
          <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* New Themes */}
      {newThemes.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            New Themes
          </h3>
          <div className="space-y-2">
            {newThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedThemeId === theme.id}
                onClick={() => onThemeClick(theme)}
              />
            ))}
          </div>
        </section>
      )}

      {/* What's Emerging */}
      {emergingThemes.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            What&apos;s Emerging
          </h3>
          <div className="space-y-2">
            {emergingThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedThemeId === theme.id}
                onClick={() => onThemeClick(theme)}
                showTrend
              />
            ))}
          </div>
        </section>
      )}

      {/* All Themes */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          All Themes
        </h3>
        <div className="space-y-2">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedThemeId === theme.id}
              onClick={() => onThemeClick(theme)}
            />
          ))}
        </div>
      </section>

      {/* Clear Filter */}
      {selectedThemeId && (
        <button
          onClick={() => onThemeClick({ id: '', title: '', description: '', count: 0, isNew: false, isEmerging: false })}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
  showTrend?: boolean;
}

function ThemeCard({ theme, isSelected, onClick, showTrend }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all ${
        isSelected
          ? 'bg-blue-500/20 border-2 border-blue-500'
          : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white truncate">{theme.title}</h4>
            {theme.isNew && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                NEW
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{theme.description}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-lg font-semibold text-white">{theme.count}</span>
          {showTrend && (
            <div className="flex items-center text-green-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
