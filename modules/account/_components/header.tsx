"use client";

import config from "@heiso/core/config";
import { usePathname } from "next/navigation";

// import { MenuItem, Menu } from '@heiso/core/types';

type MenuMeta = {
  url: string;
  icon: string;
  title: string;
};

type MenuItem = {
  name: string;
  meta: MenuMeta;
  items?: MenuItem[];
};

type Menu = MenuItem[];

function flattenMenu(menu: Menu) {
  let result: Record<string, MenuItem> = {};

  menu.forEach((item: MenuItem) => {
    if (item.meta?.url) {
      result[item.meta.url] = item;
    }
    if (item.items) {
      const flattenedItems = flattenMenu(item.items);
      result = { ...result, ...flattenedItems };
    }
  });
  return result;
}

export default function Header({ toolbar }: { toolbar: React.ReactNode }) {
  const path = usePathname();
  const baseUrl = config.auth.account.base_url;
  const menus = flattenMenu(config.auth.account.menu as Menu);
  const currentItem = path ? menus[path.replace(baseUrl, "")] : null;

  return (
    <header className="flex h-16 w-full flex-col justify-center border-b px-6 py-3">
      <nav className="flex items-center justify-between">
        <span className="font-bold text-foreground/60">
          {currentItem?.meta?.title ?? ""}
        </span>
        <div className="flex items-center space-x-4">{toolbar}</div>
      </nav>
    </header>
  );
}
