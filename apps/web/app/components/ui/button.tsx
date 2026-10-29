import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-white shadow-[0_1px_2px_rgba(11,13,16,0.16)] hover:bg-ink/90",
        secondary:
          "border border-edge bg-panel text-ink hover:border-edge-strong hover:bg-panel-muted",
        ghost: "text-ink-muted hover:bg-panel-muted hover:text-ink",
        accent:
          "bg-accent text-white shadow-[0_1px_2px_rgba(2,132,184,0.25)] hover:bg-accent-strong",
        danger:
          "border border-hard/30 bg-hard-soft text-hard hover:border-hard/50",
        link: "text-accent-strong underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
