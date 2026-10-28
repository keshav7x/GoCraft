import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    "active:translate-y-px select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-slate-950 text-white shadow-sm hover:bg-slate-800 active:bg-slate-900",
        secondary:
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        danger:
          "bg-[#b4322f] text-white shadow-sm hover:bg-[#982724]",
        accent:
          "bg-accent-600 text-white shadow-sm hover:bg-accent-700",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
