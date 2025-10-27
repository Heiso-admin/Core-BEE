import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProjectListSkeleton({
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
    <div className={`w-full space-x-3`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: rowCount }).map((_, index) => (
          <Skeleton key={index} className="h-[125px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
