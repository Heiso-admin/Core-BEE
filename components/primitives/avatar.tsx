import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarLayer,
} from "@heiso/core/components/ui/avatar";
import { cn } from "@heiso/core/lib/utils";
import { RandomAvatar } from "./random-avatar";

export function Avatar({
  image,
  displayName,
  className,
  showName = false,
}: {
  image?: string | null;
  displayName: string;
  className?: string;
  showName?: boolean;
}) {
  return (
    <div className="relative">
      <AvatarLayer className={cn("rounded-full shadow-sm h-8 w-8", className)}>
        <AvatarImage src={image ?? undefined} alt={`@${displayName}`} />
        <AvatarFallback asChild>
          <RandomAvatar name={displayName} />
        </AvatarFallback>
      </AvatarLayer>
      {showName && (
        <div className="absolute bottom-0 right-0 text-[9px] w-3.5 h-3.5 text-center rounded-sm bg-primary/80">
          {displayName.toUpperCase().slice(0, 1)}
        </div>
      )}
    </div>
  );
}
