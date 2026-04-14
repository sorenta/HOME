import React, { ElementType } from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "display";
  color?: "primary" | "secondary" | "muted" | "accent";
  className?: string;
};

export function Heading({
  as: Component = "h2",
  variant,
  color = "primary",
  className = "",
  children,
  ...props
}: HeadingProps) {
  // Map element level if variant is not specified
  const computedVariant = variant || Component;

  // Stili pÄrÅ†em --font-theme-display (Lucent izmanto var(--font-playfair))
  // Tas rada vizuÄlo sasaisti, ka visi virsraksti ir atbilstoÅ¡i tematikai
  const variantStyles = {
    display: "text-5xl sm:text-6xl font-black tracking-tight leading-[1.1]",
    h1: "text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]",
    h2: "text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.2]",
    h3: "text-2xl sm:text-3xl font-semibold tracking-normal leading-[1.3]",
    h4: "text-xl sm:text-2xl font-medium tracking-normal leading-[1.4]",
    h5: "text-lg sm:text-xl font-medium leading-[1.5]",
    h6: "text-base font-semibold uppercase tracking-wider",
  };

  const colorStyles = {
    primary: "text-[var(--color-text-primary)]",
    secondary: "text-[var(--color-text-secondary)]",
    muted: "text-[var(--color-text-muted)]",
    accent: "text-[var(--color-accent)]",
  };

  return (
    <Component
      className={`
        font-[family-name:var(--font-theme-display)]
        ${variantStyles[computedVariant]}
        ${colorStyles[color]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div";
  variant?: "body" | "lead" | "small" | "tiny";
  color?: "primary" | "secondary" | "muted" | "accent";
  className?: string;
};

export function Text({
  as: Component = "p",
  variant = "body",
  color = "secondary",
  className = "",
  children,
  ...props
}: TextProps) {
  // Lucent parasti izmanto Inter kÄ --font-theme-sans
  const variantStyles = {
    lead: "text-lg sm:text-xl font-medium leading-relaxed",
    body: "text-base sm:text-lg leading-relaxed",
    small: "text-sm leading-normal",
    tiny: "text-xs font-medium uppercase tracking-wider",
  };

  const colorStyles = {
    primary: "text-[var(--color-text-primary)]",
    secondary: "text-[var(--color-text-secondary)]",
    muted: "text-[var(--color-text-muted)]",
    accent: "text-[var(--color-accent)]",
  };

  return (
    <Component
      className={`
        font-[family-name:var(--font-theme-sans)]
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

