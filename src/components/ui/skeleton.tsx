import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}
      {...props}
    />
  );
}

export { Skeleton };
