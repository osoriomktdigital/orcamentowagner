/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#2B343B] text-white hover:bg-[#1E252A] shadow-sm',
      secondary: 'bg-white border border-[#2B343B]/12 text-[#2B343B] hover:bg-[#FBF9F5]',
      outline: 'border border-[#2B343B]/14 text-[#2B343B] hover:bg-[#2B343B]/5',
      ghost: 'text-[#2B343B] hover:bg-[#2B343B]/5',
      accent: 'bg-[#D4A373] text-white hover:bg-[#C59260] shadow-sm',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-11 px-6 text-sm font-medium',
      lg: 'h-12 px-8 text-base font-medium',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('bg-white rounded-xl border border-[#2B343B]/6 shadow-warm p-6', className)}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-md border border-[#2B343B]/14 bg-white px-3 py-2 text-sm placeholder:text-[#2B343B]/40 focus:outline-none focus:ring-3 focus:ring-[#D4A373]/25 focus:border-[#D4A373] transition-all',
        className
      )}
      {...props}
    />
  )
);

export const Badge = ({ children, variant = 'neutral', className }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'neutral', className?: string }) => {
  const styles = {
    success: 'bg-[#6B8F71]/12 text-[#426347]',
    warning: 'bg-[#D4A373]/16 text-[#946838]',
    error: 'bg-red-50 text-red-700',
    neutral: 'bg-[#2B343B]/5 text-[#2B343B]',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', styles[variant], className)}>
      {children}
    </span>
  );
};
