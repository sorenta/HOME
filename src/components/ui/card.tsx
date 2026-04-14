"use client";

import React, { ReactNode } from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  variant?: "default" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({ 
  children, 
  className = "", 
  variant = "default", 
  padding = "md",
  style, 
  ...rest 
}: CardProps) {
  // Pad adjustments based on Lucent spacing
  const paddingClasses = {
    none: "p-0",
    sm: "p-4 sm:p-5",
    md: "p-6 sm:p-8", // Lucent defaults
    lg: "p-8 sm:p-12",
  };

  // Automatically applies theme CSS variables defined in globals.css/theme-logic.ts
  return (
    <div
      className={`
        relative overflow-hidden transition-all duration-400 ease-out
        ${paddingClasses[padding]}
        ${variant === "interactive" ? "hover:scale-[1.01] active:scale-[0.99] cursor-pointer" : ""}
        ${className}
      `}
      style={{
        backgroundColor: variant === "elevated" ? "var(--color-card-elevated)" : "var(--color-card)",
        borderRadius: "var(--radius-card)",
        border: "var(--theme-panel-border, 1px solid var(--color-border))",
        boxShadow: "var(--panel-shadow, 0 8px 30px rgba(0,0,0,0.05))",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        ...style,
      }}
      {...rest}
    >
      {/* Decorative pseudo-element holder for themes like Hive (octagon) or Botanical (leaf) */}
      <div className="absolute inset-0 pointer-events-none theme-card-decorator" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

