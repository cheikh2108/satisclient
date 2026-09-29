import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCount, maxLength, ...props }, ref) => {
    const [count, setCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-600/30 focus:border-primary-600 dark:focus:border-primary-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200 resize-y',
            error && 'border-red-500 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {count}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
