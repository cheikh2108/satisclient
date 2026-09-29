import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className={cn(
              'peer h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a]',
              'checked:bg-primary-600 checked:border-primary-600 dark:checked:bg-primary-600 dark:checked:border-primary-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200 cursor-pointer',
              error && 'border-red-500 dark:border-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          <Check className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {(label || helperText || error) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {error && (
              <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
