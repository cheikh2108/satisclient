'use client';

import { BarChart3, TrendingUp, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ChartView } from './metric-chart';

export interface PeriodOption {
  label: string;
  points?: number;
}

interface ViewToggleProps {
  value: ChartView;
  onChange: (view: ChartView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange('curve')}
        className={`rounded-md p-1.5 transition-colors ${
          value === 'curve'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Curve view"
      >
        <TrendingUp size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => onChange('bars')}
        className={`rounded-md p-1.5 transition-colors ${
          value === 'bars'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Bar view"
      >
        <BarChart3 size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

interface PeriodSelectProps {
  value: string;
  options: PeriodOption[];
  onChange: (option: PeriodOption) => void;
  accentText?: string;
}

export function PeriodSelect({ value, options, onChange, accentText }: PeriodSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selected = options.find((o) => o.label === value) ?? options[0];

  return (
    <div ref={ref} className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium transition-colors hover:bg-muted/60"
        style={{ color: accentText }}
      >
        {selected?.label}
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-border bg-card shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                  option.label === value
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
