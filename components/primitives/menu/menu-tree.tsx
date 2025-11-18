"use client";

import { DynamicIcon, type iconNames } from "lucide-react/dynamic";
import { useMemo, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { MenuItem } from ".";

type IconName = (typeof iconNames)[number];

interface MenuTreeProps {
  style?: React.CSSProperties;
  items: MenuItem[];
  editable?: {
    allowIcon?: Array<number>;
    onAddItem: (item: MenuItem) => void;
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (
      dragId: string,
      hoverId: string,
      position: 'before' | 'after' | 'inside'
    ) => void;
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
    disabled?: boolean;
  };
  renderRight?: (item: MenuItem) => React.ReactNode;
  selectPermission?: {
    selectedItems: string[]; // 已選中的 permission ids
    onSelectionChange: (permissionId: string, checked: boolean) => void;
    disabled?: boolean;
  };
}

interface MenuTreeItemProps {
  style?: React.CSSProperties;
  item: MenuItem;
  editable?: {
    allowIcon?: Array<number>;
    onAddItem: (item: MenuItem) => void;
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
    disabled?: boolean;
  };
  renderRight?: (item: MenuItem) => React.ReactNode;
  selectPermission?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
  };
}



export function MenuTree({
  style,
  items,
  editable,
  selectable,
  selectPermission,
}: MenuTreeProps) {
  return (
    <div>
      {items.map((item) => (
        <MenuTreeItem
          style={style}
          key={item.id}
          item={item}
          editable={editable}
          selectable={selectable}
          selectPermission={selectPermission}
        />
      ))}
    </div>
  );
}

function MenuTreeItem({
  style,
  item,
  selectable,
  selectPermission,
}: MenuTreeItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectable?.selectedItems.includes(item.id);
  const isDisabled = !!selectable?.disabled;

  return (
    <div
      ref={ref}
      className={"grid items-start min-h-11 group transition-colors mb-4"} style={style}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2 text-muted-foreground">
        {/* Checkbox for selection */}
        {selectable && (
          <Checkbox
            checked={isSelected}
            disabled={isDisabled}
            onCheckedChange={(checked) => {
              selectable?.onSelectionChange(item.id, checked as boolean);
            }}
            className="mr-2"
          />
        )}
        {/* Menu */}
        {item.icon && <DynamicIcon name={item.icon as IconName} size={20} />}
        <span className="text-sm font-medium truncate block">
          {item.title}
          <span className="text-xs text-muted-foreground/70">
            {item.group ? ` / ${item.group}` : ""}
          </span>
        </span>
      </div>

      {/* Right side custom renderer (e.g., permissions) */}
      <MenuPermissionItem selectPermission={selectPermission} item={item} isSelected={isSelected} />

    </div>
  );
}

function MenuPermissionItem({
  item,
  selectPermission,
  isSelected,
}: {
  item: MenuItem & { permissions?: Array<{ id: string; resource: string; action: string }> };
  selectPermission?: { selectedItems: string[]; onSelectionChange: (permissionId: string, checked: boolean) => void; disabled?: boolean };
  isSelected?: boolean;
}) {
  const perms = (item as any).permissions || [];

  const grouped = useMemo(() => {
    const map = new Map<string, Array<{ id: string; resource: string; action: string }>>();
    for (const p of perms) {
      const arr = map.get(p.resource) ?? [];
      arr.push(p);
      map.set(p.resource, arr);
    }
    return Array.from(map.entries()); // [[resource, permissions[]], ...]
  }, [perms]);

  // if (!grouped.length) return <span className="text-xs text-muted-foreground">-</span>;

  const selected = selectPermission?.selectedItems ?? [];
  const disabledAll = !!selectPermission?.disabled;

  const toggle = (id: string, checked: boolean) => {
    if (!selectPermission) return;
    selectPermission.onSelectionChange(id, checked);
  };

  return (
    <div className="flex items-start flex-col gap-2.5">
      {grouped.map(([resource, list]) => (
        <div key={`${item.id}-${resource}`} className="flex gap-3 items-start">
          <span className="text-sm text-muted-foreground min-w-16 truncate font-bold">{resource}</span>
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
            {list.map((p) => {
              const checkboxId = `perm-${item.id}-${p.id}`;
              const labelId = `perm-label-${item.id}-${p.id}`;
              const checked = selected.includes(p.id);
              return (
                <div key={p.id} className="inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    id={checkboxId}
                    aria-labelledby={labelId}
                    checked={checked}
                    disabled={disabledAll || !isSelected}
                    onCheckedChange={(c) => toggle(p.id, Boolean(c))}
                  />
                  <label
                    id={labelId}
                    htmlFor={checkboxId}
                    className={cn("text-muted-foreground", !disabledAll && "cursor-pointer")}
                  >
                    {p.action}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
