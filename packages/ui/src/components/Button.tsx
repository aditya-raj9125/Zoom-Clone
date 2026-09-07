import React from "react";
import { cn } from "../index";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", pill = true, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

    const variantStyles = {
      primary: "bg-[#0B5CFF] hover:bg-[#004BDE] text-white shadow-sm hover:shadow-md active:scale-[0.98]",
      secondary: "bg-[#EBF2FF] hover:bg-[#D6E6FF] text-[#0B5CFF] active:scale-[0.98]",
      outline: "border border-slate-300 hover:border-slate-400 bg-transparent text-slate-800 hover:bg-slate-50 active:scale-[0.98]",
      ghost: "text-slate-700 hover:text-slate-950 hover:bg-black/5 active:scale-[0.98]",
      white: "bg-white hover:bg-slate-100 text-slate-900 shadow-sm active:scale-[0.98]",
      dark: "bg-[#00052D] hover:bg-[#0B2B7A] text-white border border-white/20 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    const radiusStyles = pill ? "rounded-full" : "rounded-xl";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], radiusStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
