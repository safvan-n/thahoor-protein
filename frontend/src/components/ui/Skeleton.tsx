import { cn } from "../../lib/utils";

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-stone-100", className)}
      {...props}
    />
  );
}

export { Skeleton };
import type { HTMLAttributes } from "react";
