import React from "react";
import { cn } from "../index";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "ai-gradient" | "pill-outline" | "blue-subtle" | "dark-glass";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "blue-subtle",
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 font-medium rounded-full text-xs px-3 py-1";

  const variantStyles = {
    "ai-gradient": "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm",
    "pill-outline": "border border-slate-200 bg-white text-slate-700 shadow-2xs",
    "blue-subtle": "bg-[#EBF2FF] text-[#0B5CFF]",
    "dark-glass": "bg-white/10 backdrop-blur-md text-white border border-white/15",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
};
