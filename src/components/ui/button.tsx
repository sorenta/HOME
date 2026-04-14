"use client";

import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  // Pamata klases visiem poga veidiem (uztver motÄ«va :active / hover efektus)
  const baseClasses = `
    inline-flex items-center justify-center 
    font-semibold tracking-wide transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // IzmÄ“ru skalÄ“Å¡ana, adaptÄ“joties uz mobilajiem ierÄ«cÄ“m (piemÄ“ram, HomeOS appam max-w-lg)
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm sm:text-base",
    lg: "px-8 py-3.5 text-base sm:text-lg",
    icon: "p-2 w-10 h-10 shrink-0",
  };

  // UzmanÄ«gi izmantojam krÄsu mainÄ«gos no theme-logic.ts / globals.css
  const variantStyles = {
    primary: {
      backgroundColor: "var(--color-button-primary)",
      color: "var(--color-button-primary-text)",
      boxShadow: "0 4px 14px color-mix(in srgb, var(--color-button-primary) 30%, transparent)",
      borderRadius: "var(--radius-button)",
      border: "none",
    },
    secondary: {
      backgroundColor: "var(--color-button-secondary)",
      color: "var(--color-button-secondary-text)",
      boxShadow: "0 2px 8px color-mix(in srgb, var(--color-text-primary) 5%, transparent)",
      borderRadius: "var(--radius-button)",
      border: "1px solid var(--color-border)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border-strong)",
      borderRadius: "var(--radius-button)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--color-text-secondary)",
      borderRadius: "var(--radius-button)",
    },
  };

  return (
    <button
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variant === "ghost" ? "hover:bg-black/5 dark:hover:bg-white/5 active:scale-95" : "hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[0px]"}
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

