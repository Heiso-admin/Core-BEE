"use client";

import { RandomAvatar, ThemeSwitcher } from "@heiso/core/components/primitives";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@heiso/core/components/ui/avatar";
import { Badge } from "@heiso/core/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@heiso/core/components/ui/dropdown-menu";
import { useAccount } from "@heiso/core/providers/account";
import { usePermissionContext } from "@heiso/core/providers/permission";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export interface UserAvatarMenuItem {
  id: string;
  text?: string;
  href?: string;
  type?: "Group" | "Link" | "Separator" | "Theme" | "LogOut";
  group?: UserAvatarMenuItem[];
}

// TODO: avataaars generator
export function UserAvatar({
  className,
  menu,
}: {
  className?: string;
  menu: UserAvatarMenuItem[];
}) {
  const { account } = useAccount();
  const { role } = usePermissionContext();

  // const menu = [
  //   {
  //     id: 'user',
  //     type: 'Group',
  //     group: [
  //       {
  //         id: 'dashboard',
  //         text: 'Dashboard',
  //         href: '/dashboard',
  //         type: 'Link',
  //       },
  //       {
  //         id: 'dev-center',
  //         text: 'Dev Center',
  //         href: '/dev-center',
  //         type: 'Link',
  //       },
  //       {
  //         id: 'accountSettings',
  //         text: 'Account Settings',
  //         href: '/account/me',
  //         type: 'Link',
  //       },
  //     ],
  //   },
  //   {
  //     id: 'separator1',
  //     type: 'Separator',
  //   },
  //   {
  //     id: 'theme',
  //     text: 'Theme',
  //     type: 'Theme',
  //   },
  //   {
  //     id: 'separator2',
  //     type: 'Separator',
  //   },
  //   {
  //     id: 'homePage',
  //     text: 'Home Page',
  //     href: '/',
  //     type: 'Link',
  //   },
  //   {
  //     id: 'logOut',
  //     text: 'Log out',
  //     type: 'LogOut',
  //   },
  // ] satisfies MenuItem[];

  if (!account) return null;

  const image = account?.avatar ?? "";
  const displayName = account?.name ?? "";
  const email = account?.email ?? "";

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <Avatar className="rounded-full shadow-sm h-8 w-8">
              <AvatarImage src={image} alt={`@${displayName}`} />
              <AvatarFallback asChild>
                <RandomAvatar name={displayName} />
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 text-[9px] w-3.5 h-3.5 text-center rounded-sm bg-primary/80">
              {displayName.toUpperCase().slice(0, 1)}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>
            <p className="font-bold text-sm flex justify-between">
              {displayName}
              <Badge
                className="ml-1 text-xs text-muted-foreground"
                variant="outline"
              >
                {role}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {menu.map((item) => {
            if (item.type === "Group") {
              return (
                <DropdownMenuGroup key={item.id}>
                  {item.group?.map((subItem) => (
                    <Link key={subItem.id} href={subItem.href ?? ""}>
                      <DropdownMenuItem>{subItem.text}</DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuGroup>
              );
            }

            if (item.type === "Link") {
              return (
                <Link key={item.id} href={item.href ?? ""}>
                  <DropdownMenuItem>{item.text}</DropdownMenuItem>
                </Link>
              );
            }

            if (item.type === "Separator") {
              return <DropdownMenuSeparator key={item.id} />;
            }

            if (item.type === "Theme") {
              return (
                <DropdownMenuItem key={item.id}>
                  {item.text}
                  <DropdownMenuShortcut>
                    <ThemeSwitcher />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            }

            if (item.type === "LogOut") {
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    signOut({
                      callbackUrl: `${window.location.origin}/login`,
                    });
                  }}
                >
                  {item.text}
                  <DropdownMenuShortcut>
                    <LogOut className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            }

            return null;
          })}

          {/* <DropdownMenuGroup>
            <Link href="/dashboard">
              <DropdownMenuItem>Dashboard</DropdownMenuItem>
            </Link>
            {isDeveloper && (
              <Link href="/dev-center">
                <DropdownMenuItem>Dev Center</DropdownMenuItem>
              </Link>
            )}
            <Link href="/account/me">
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Theme
            <DropdownMenuShortcut>
              <ThemeSwitcher />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/">Home Page</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              signOut({
                callbackUrl: '/',
              });
            }}
          >
            Log out
            <DropdownMenuShortcut>
              <LogOut className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
