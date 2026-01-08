"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@heiso/core/components/ui/dropdown-menu";
import { cn } from "@heiso/core/lib/utils";
import { Ellipsis, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";

type SidebarNavListProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleKey?: string;
  /** 自訂右側動作節點（例如 <AddDialog> 包 Button） */
  actionSlot?: React.ReactNode;
  onAddClick?: () => void;
};

export function SidebarNavList({
  children,
  className,
  title,
  actionSlot,
  onAddClick,
}: SidebarNavListProps) {
  return (
    <div className={cn("w-64 min-w-3xs flex flex-col", className)}>
      <h3 className="h-12 flex items-center justify-between px-4 text-lg font-semibold">
        {title}
        {actionSlot ??
          (onAddClick ? (
            <Button
              variant="ghost"
              className="ml-auto -mr-4"
              size="icon_sm"
              onClick={onAddClick}
            >
              <SquarePlus className="w-4 h-4" />
            </Button>
          ) : null)}
      </h3>
      <div className="space-y-2 border-t flex-1 overflow-auto py-3">
        {children}
      </div>
    </div>
  );
}

type SidebarNavItemAction = {
  id?: string;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export function SidebarNavItem({
  className,
  dropdownButtonProps,
  children,
  icon = <Ellipsis className="size-4" />,
  onEdit,
  onRemove,
  actions,
  afterButton,
  menuOpen,
  onMenuOpenChange,
  ...props
}: React.ComponentProps<"div"> & {
  children: React.ReactNode;
  dropdownButtonProps?: React.ComponentProps<typeof DropdownMenuTrigger>;
  icon?: React.ReactNode;
  onEdit?: () => void;
  onRemove?: () => void;
  actions?: SidebarNavItemAction[];
  afterButton?: React.ReactNode;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("components.sidebarNavList");
  const [internalOpen, setInternalOpen] = useState(false);
  const open = menuOpen ?? internalOpen;
  const handleOpenChange = (next: boolean) => {
    if (menuOpen === undefined) {
      setInternalOpen(next);
    }
    onMenuOpenChange?.(next);
  };
  return (
    <div
      className={cn(
        "min-h-9 flex items-center justify-between rounded-md group text-muted-foreground hover:bg-sidebar-accent",
        className,
      )}
      data-menu-open={open}
      {...props}
    >
      {children}
      {icon !== "" && (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild {...dropdownButtonProps}>
            <Button variant="ghost" size="icon" className="text-current">
              {icon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto">
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>{t("edit")}</DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onRemove}
              >
                {t("remove")}
              </DropdownMenuItem>
            )}
            {actions?.map((action) => (
              <DropdownMenuItem
                key={
                  action.id ??
                  (typeof action.label === "string"
                    ? action.label
                    : action.onClick.name || "action")
                }
                className={action.className}
                onClick={action.onClick}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {afterButton}
    </div>
  );
}

export function SidebarItemLink({
  className,
  children,
  href,
  active,
  ...props
}: React.ComponentProps<"a"> & {
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-1 block px-3 py-1 text-sm truncate text-muted-foreground group-hover:text-current",
        active && "text-current",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
