import * as React from "react";

import { cn } from "@/lib/utils";

type MaterialSymbolProps = React.HTMLAttributes<HTMLSpanElement> & {
  icon: string;
  filled?: boolean;
};

export function MaterialSymbol({
  icon,
  filled,
  className,
  style,
  ...props
}: MaterialSymbolProps) {
  return (
    <span
      className={cn("select-none leading-none", filled && "filled", className)}
      style={{
        fontFamily: '"Material Symbols Outlined"',
        fontVariationSettings: filled
          ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24'
          : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {icon}
    </span>
  );
}
