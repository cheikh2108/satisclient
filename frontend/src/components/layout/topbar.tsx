'use client';

import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((segment, index) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-sm shadow-slate-900/[0.02] dark:shadow-none">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Avec espace pour hamburger sur mobile/tablette */}
        <div className="flex items-center gap-2 text-xs sm:text-sm ml-14 lg:ml-0">
          <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">Dashboard</span>
          <span className="text-slate-400 select-none hidden xs:inline">›</span>
          <span className="font-semibold text-slate-900 dark:text-white">Overview</span>
        </div>

        {/* Search + Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 sm:h-10 w-[180px] lg:w-[220px] rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-600/30 focus:border-primary-600 dark:focus:border-primary-600 transition-all"
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
