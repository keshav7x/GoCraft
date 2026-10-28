"use client";

import { Search, X } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900",
        "placeholder:text-slate-400 shadow-sm transition",
        "hover:border-slate-300 focus:border-accent-500 focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

type SearchInputProps = Omit<InputProps, "type"> & {
  onClear?: () => void;
};

export function SearchInput({ className, onClear, value, ...props }: SearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <Input
        type="search"
        value={value}
        className={cn("pl-9", hasValue && onClear && "pr-8", "[&::-webkit-search-cancel-button]:hidden")}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

type SelectProps = InputHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition",
        "hover:border-slate-300 focus:border-accent-500 focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-slate-50",
        className,
      )}
      {...(props as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
    >
      {children}
    </select>
  );
}
