/**
 * @zoom-clone/ui
 * Reusable design-system primitives and component tokens for Zoom Clone.
 *
 * In accordance with Phase 1 architecture guidelines, this package establishes
 * the modular UI foundation that the Next.js frontend (apps/web) consumes.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditionally merging Tailwind CSS classes cleanly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Scaffolding token exports for Phase 2 UI implementation
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
