'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (tabId: string) => void;
} | null>(null);

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  children,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const variantStyles = {
    default: {
      container: 'border-b border-slate-200 dark:border-slate-800/40',
      tab: 'px-4 py-2.5 text-sm font-medium transition-all',
      active: 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600',
      inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
    },
    pills: {
      container: 'bg-slate-100 dark:bg-[#0f0f0f] rounded-lg p-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white shadow-sm',
      inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
    },
    underline: {
      container: 'gap-6',
      tab: 'pb-3 text-sm font-medium transition-all relative',
      active: 'text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600',
      inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div>
        {/* Tab List */}
        <div className={cn('flex', styles.container)}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                styles.tab,
                activeTab === tab.id ? styles.active : styles.inactive,
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">{children}</div>
      </div>
    </TabsContext.Provider>
  );
}

export function TabPanel({
  tabId,
  children,
}: {
  tabId: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabPanel must be used within Tabs');
  }

  if (context.activeTab !== tabId) return null;

  return <div className="animate-in fade-in duration-200">{children}</div>;
}
