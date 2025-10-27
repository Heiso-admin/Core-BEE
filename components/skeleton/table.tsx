import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({
  classNames,
  rowCount = 10,
}: {
  classNames?: {
    table?: string;
    row?: string;
  };
  rowCount?: number;
}) {
  return (
    <div
      className={`w-full flex flex-col items-start gap-2 ${classNames?.table}`}
    >
      <Skeleton className={cn("h-8 w-[250px]", classNames?.row)} />

      {Array.from({ length: rowCount }).map((_, index) => (
        <Skeleton key={index} className={cn("h-8 w-full", classNames?.row)} />
      ))}
    </div>
  );
}
