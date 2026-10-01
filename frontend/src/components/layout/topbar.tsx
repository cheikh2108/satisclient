"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await apiClient.get<SearchResult[]>("/search", {
          params: { q: searchQuery },
        });
        setSearchResults(data);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb = pathSegments.map((segment, index) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-sm shadow-slate-900/[0.02] dark:shadow-none">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Avec espace pour hamburger sur mobile/tablette */}
        <div className="flex items-center gap-2 text-xs sm:text-sm ml-14 lg:ml-0">
          <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">
            Dashboard
          </span>
          <span className="text-slate-400 select-none hidden xs:inline">›</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Overview
          </span>
        </div>

        {/* Search + Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
              }}
              className="h-9 sm:h-10 w-[180px] lg:w-[220px] rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-600/30 focus:border-primary-600 dark:focus:border-primary-600 transition-all"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#151515]">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => {
                      router.push(result.href);
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">
                      {result.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {result.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <div className="h-4 w-4" />
            ) : theme === "dark" ? (
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
