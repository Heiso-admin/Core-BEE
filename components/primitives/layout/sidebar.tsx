"use client";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@heiso/core/components/primitives";
import type { Navigation } from "@heiso/core/types/client";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function DashboardSidebar({ navigation }: { navigation?: Navigation }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (!navigation) return null;

  // 分段最長匹配：只選擇分段數匹配最高的連結作為唯一 active
  const normalize = (p: string) =>
    (p.startsWith("/") ? p : `/${p}`).replace(/\/+$/, "");
  const segs = (p: string) => normalize(p).split("/").filter(Boolean);
  const scoreMatch = (current: string, base: string) => {
    const cur = segs(current);
    const b = segs(base);
    for (let i = 0; i < b.length; i++) {
      if (cur[i] !== b[i]) return -1;
    }
    return b.length;
  };

  const linkBases: string[] = [];
  navigation.items.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((sub) => {
        linkBases.push(`${navigation.rootPath}${sub.path ?? ""}`);
      });
    } else {
      linkBases.push(`${navigation.rootPath}${item.path ?? ""}`);
    }
  });

  let activeBase = "";
  let best = -1;
  for (const base of linkBases) {
    const s = scoreMatch(pathname, base);
    if (s > best) {
      best = s;
      activeBase = base;
    }
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="bg-transparent justify-between gap-10 border-r dark:bg-transparent">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-2">
            {navigation.items.map((item) => {
              const groupKey = Array.isArray(item)
                ? `group:${item
                    .map((si) => si.path ?? si.title ?? "")
                    .join("|")}`
                : `link:${item.path ?? item.title ?? ""}`;

              return Array.isArray(item) ? (
                <div
                  key={groupKey}
                  className="flex flex-col border-t pt-2 gap-1"
                >
                  {item.map((subItem) => (
                    <SidebarLink
                      key={`link:${navigation.rootPath}${subItem.path ?? subItem.title ?? ""}`}
                      rootPath={navigation.rootPath}
                      link={{
                        title: subItem.title!,
                        icon: subItem.icon,
                        path: subItem.path!,
                      }}
                      isActive={(() => {
                        const base = `${navigation.rootPath}${subItem.path ?? ""}`;
                        return base === activeBase;
                      })()}
                    />
                  ))}
                </div>
              ) : (
                <SidebarLink
                  key={`link:${navigation.rootPath}${item.path ?? item.title ?? ""}`}
                  rootPath={navigation.rootPath}
                  link={{
                    title: item.title!,
                    icon: item.icon,
                    path: item.path!,
                  }}
                  isActive={(() => {
                    const base = `${navigation.rootPath}${item.path ?? ""}`;
                    return base === activeBase;
                  })()}
                />
              );
            })}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
