"use client";

import { GripVertical } from "lucide-react";
import { DynamicIcon, type iconNames } from "lucide-react/dynamic";
import { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { MenuItem } from ".";

type IconName = (typeof iconNames)[number];

interface MenuTreeProps {
  className?: string;
  items: MenuItem[];
  editable?: {
    allowIcon?: Array<number>;
    maxLevel?: number; // Maximum allowed nesting level
    onAddItem: (item: MenuItem) => void;
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (
      dragId: string,
      hoverId: string,
      position: "before" | "after" | "inside",
    ) => void;
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
  };
  level?: number;
  expands?: (item: MenuItem) => React.ReactNode;
}

interface MenuTreeItemProps {
  item: MenuItem;
  editable?: {
    allowIcon?: Array<number>;
    maxLevel?: number;
    onAddItem: (item: MenuItem) => void;
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (
      dragId: string,
      hoverId: string,
      position: "before" | "after" | "inside",
    ) => void;
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
  };
  level: number;
  expands?: (item: MenuItem) => React.ReactNode;
}

interface DragItem {
  id: string;
  type: string;
  sourceLevel: number; // Track the source level of dragged item
}

export function MenuTree({
  className,
  items,
  editable,
  selectable,
  level = 0,
  expands,
}: MenuTreeProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn(className)}>
        {items.map((item) => (
          <MenuTreeItem
            key={item.id}
            item={item}
            editable={editable}
            level={level}
            expands={expands}
            selectable={selectable}
          />
        ))}
      </div>
    </DndProvider>
  );
}

function MenuTreeItem({
  item,
  editable,
  level,
  expands,
  selectable,
}: MenuTreeItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState<
    "before" | "after" | "inside" | null
  >(null);

  const maxLevel = editable?.maxLevel ?? 3;
  const readonly = !editable;

  const [{ isDragging }, drag, preview] = useDrag({
    type: "NAVIGATION_ITEM",
    item: {
      id: item.id,
      type: "NAVIGATION_ITEM",
      sourceLevel: level,
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !readonly,
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "NAVIGATION_ITEM",
    drop: (dragItem: DragItem, monitor) => {
      if (readonly) return;

      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      const dragId = dragItem.id;
      if (dragId !== item.id && dragPosition) {
        // Only allow drop if it won't exceed maxLevel
        if (dragPosition === "inside" && level >= maxLevel - 1) {
          return;
        }
        editable?.onMoveItem(dragId, item.id, dragPosition);
      }
      setDragPosition(null);
    },
    hover: (dragItem: DragItem, monitor) => {
      if (readonly || !ref.current) return;

      const dragId = dragItem.id;
      if (dragId === item.id) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Determine drop position
      if (hoverClientY < hoverMiddleY * 0.3) {
        setDragPosition("before");
      } else if (hoverClientY > hoverMiddleY * 1.7) {
        setDragPosition("after");
      } else {
        // Only allow 'inside' position if it won't exceed maxLevel
        if (level < maxLevel - 1) {
          setDragPosition("inside");
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop:
        monitor.canDrop() &&
        !readonly &&
        // Prevent dropping inside if it would exceed maxLevel
        !(dragPosition === "inside" && level >= maxLevel - 1),
    }),
  });

  // Connect drag and drop refs
  const dragRef = readonly ? null : drag(ref);
  const dropRef = readonly ? null : drop(ref);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectable?.selectedItems.includes(item.id);

  return (
    <div
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-30 scale-95 rotate-1 shadow-lg",
        isOver && canDrop && "bg-muted",
      )}
    >
      {/* Drop indicator lines */}
      {isOver && canDrop && dragPosition === "before" && (
        <div className="h-0.5 bg-blue-500 mx-4 -mb-0.5 relative z-10" />
      )}

      <div
        ref={ref}
        className={cn(
          "flex items-center py-1 px-4 min-h-11 group transition-colors border",
          level > 0 && "ml-8 border-l-1",
          isOver &&
          canDrop &&
          dragPosition === "inside" &&
          "bg-mute-200 border-mute-300",
        )}
        style={{ marginLeft: `${level * 32 + 16}px` }}
      >
        {/* Drag Handle */}
        {!readonly && (
          <div className="cursor-move mr-3">
            <GripVertical className="text-muted-foreground h-4 w-4" />
          </div>
        )}

        {/* Checkbox for selection */}
        {selectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              selectable?.onSelectionChange(item.id, checked as boolean);
            }}
            className="mr-2"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {item.icon && <DynamicIcon name={item.icon as IconName} size={20} />}
          <span className="text-sm font-medium truncate block">
            {item.title}{" "}
            <span className="text-xs text-muted-foreground">
              {item.group ? `/ ${item.group}` : ""}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <>{expands && expands(item)}</>

          {!readonly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editable?.onAddItem(item)}
                className="h-8 px-3 text-xs"
              >
                Add new
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editable?.onEditItem(item)}
                className="h-8 px-3 text-xs"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editable?.onDeleteItem(item.id)}
                className="h-8 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Drop indicator line after */}
      {isOver && canDrop && dragPosition === "after" && (
        <div className="h-0.5 bg-mute-500 mx-4 -mt-0.5 relative z-10" />
      )}

      {/* Children */}
      {hasChildren && item.children && (
        <MenuTree
          items={item.children}
          selectable={selectable}
          editable={editable}
          level={level + 1}
          expands={expands}
        />
      )}
    </div>
  );
}
