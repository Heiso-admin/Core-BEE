"use client";

import { cn } from "@heiso/core/lib/utils";
import type { SubNavProps } from "@heiso/core/types/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubNav({ rootPath, className, title, groups }: SubNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn("w-64 border-r", className)}>
      <h3 className="h-12 flex items-center px-6 text-lg font-semibold">
        {title}
      </h3>

      <div className="space-y-2">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="px-3 py-5 border-t">
            <h4 className="text-xs px-3 font-medium uppercase tracking-wide mb-3">
              {group.title}
            </h4>
            <nav className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const active = pathname.startsWith(`${rootPath}${item.href}`);
                return (
                  <Link
                    key={itemIndex}
                    target={item.target}
                    href={`${rootPath}${item.href}`}
                    className={cn(
                      "block px-3 py-1 text-sm rounded-md text-muted-foreground hover:text-current hover:bg-muted",
                      active && "bg-muted text-current font-medium",
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
