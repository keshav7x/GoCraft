import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring h-9 w-full rounded-lg border border-edge bg-panel px-3 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-edge-strong focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function SearchInput({
  className,
  onClear,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { onClear?: () => void }) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <Input className="pl-9 pr-9" {...props} />
      {onClear && props.value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint transition-colors hover:text-ink"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-edge-strong focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focus-ring h-9 cursor-pointer appearance-none rounded-lg border border-edge bg-panel bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2398a0ac%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.65rem_center] bg-no-repeat py-0 pl-3 pr-8 text-sm text-ink transition-colors hover:border-edge-strong",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[13px] font-medium text-ink", className)}
      {...props}
    />
  );
}
