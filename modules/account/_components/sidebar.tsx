"use client";

import { Copyright, Logo, LucideIcon } from "@heiso/core/components/primitives";
import { Button } from "@heiso/core/components/ui/button";
import { ScrollArea } from "@heiso/core/components/ui/scroll-area";
import config from "@heiso/core/config";
import { cn } from "@heiso/core/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar() {
  const path = usePathname();

  const baseUrl = config.auth.account.base_url;
  const menu = config.auth.account.menu as Menu;

  return (
    <aside className="w-64 h-full bg-background/60 border-r border-border flex flex-col">
      <Logo
        href="/account"
        classNames={{
          main: "flex h-16 items-center border-b px-4 py-3",
          img: "w-20",
          text: "flex items-center space-x-2 ml-2 text-lg font-bold tracking-wider",
        }}
        hasTitle={false}
      />

      <nav className="flex-1 text-sm h-full overflow-hidden">
        <ScrollArea className="h-full">
          <ul className="space-y-2">
            {/* <li className="border-b last:border-0 px-2">
              <Button
                variant="ghost"
                className="w-full justify-start my-3"
                asChild
              >
                <Link
                  href={`${config.dashboard.base_url}`}
                  className={'flex items-center py-2 hover:text-primary'}
                >
                  <LucideIcon name="ArrowLeft" size={16} className="mr-2" />
                  Dashboard
                </Link>
              </Button>
            </li> */}

            {menu.map((e, i) => (
              <li key={`menu-${i}`} className="border-b last:border-0">
                {e.items ? (
                  <div className="space-y-4 px-6 py-4">
                    <h4 className="font-semibold text-muted-foreground">
                      {e.name}
                    </h4>

                    <ul>
                      {e.items.map((item, j) => (
                        <li key={`menu-${i}-${j}`}>
                          <Link
                            href={`${baseUrl}${item.meta.url}`}
                            className={cn(
                              "flex items-center py-2 hover:text-primary",
                              path === `${baseUrl}${item.meta.url}` &&
                                "text-primary/90",
                            )}
                          >
                            <LucideIcon
                              name={item.meta.icon}
                              size={16}
                              className="mr-2"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4 px-2 py-4">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        path === `${baseUrl}${e.meta.url}` && "text-primary/90",
                      )}
                      asChild
                    >
                      <Link href={`${baseUrl}${e.meta.url}`}>
                        <LucideIcon
                          name={e.meta.icon}
                          size={16}
                          className="mr-2"
                        />
                        {e.name}
                      </Link>
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </nav>

      <Copyright />
    </aside>
  );
}
