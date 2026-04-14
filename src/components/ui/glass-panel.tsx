"use client";

import React, { ReactNode } from "react";
import { Card } from "./card"; // BÄzes komponente tagad pÄrvalda visu

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/**
 * @deprecated Use the new <Card /> component directly for universal theme support.
 * Å Ä« komponente saglabÄta atpakaÄ¼saderÄ«bai un automÄtiski izmanto jauno Card skeletu.
 */
export function GlassPanel({ children, className = "", style, ...rest }: Props) {
  return (
    <Card className={className} style={style} {...rest}>
      {children}
    </Card>
  );
}

