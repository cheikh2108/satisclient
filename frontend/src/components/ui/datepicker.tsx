'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatepickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Datepicker({
  label,
  error,
  helperText,
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  min,
  max,
  disabled,
  required,
}: DatepickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          className={cn(
            'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-3 py-2 pr-10 text-sm text-slate-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-600/30 focus:border-primary-600 dark:focus:border-primary-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            error && 'border-red-500 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500'
          )}
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

// Date Range Picker
export interface DateRangePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function DateRangePicker({
  label,
  error,
  helperText,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled,
  required,
}: DateRangePickerProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Datepicker
          value={startDate}
          onChange={onStartDateChange}
          placeholder="Date de début"
          disabled={disabled}
          max={endDate}
        />
        <Datepicker
          value={endDate}
          onChange={onEndDateChange}
          placeholder="Date de fin"
          disabled={disabled}
          min={startDate}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
