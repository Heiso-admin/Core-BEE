"use client";

import { Icon } from "@iconify/react";
import {
  Edit2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSite } from "@/providers/site";
import type { NavigationItem } from ".";

interface NavigationTreeProps {
  className?: string;
  items: NavigationItem[];
  editable?: {
    allowIcon?: Array<number>;
    maxLevel?: number; // Maximum allowed nesting level
    onEditItem: (item: NavigationItem) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (
      dragId: string,
      hoverId: string,
      position: "before" | "after" | "inside",
    ) => void;
    onToggleEnabled?: (itemId: string, enabled: boolean) => void;
    disableDrag?: boolean; // Add disableDrag option
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
  };
  level?: number;
  expands?: (item: NavigationItem) => React.ReactNode;
}

interface NavigationTreeItemProps {
  allItems: NavigationItem[];
  item: NavigationItem;
  editable?: {
    allowIcon?: Array<number>;
    maxLevel?: number;
    onEditItem: (item: NavigationItem) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (
      dragId: string,
      hoverId: string,
      position: "before" | "after" | "inside",
    ) => void;
    onToggleEnabled?: (itemId: string, enabled: boolean) => void;
    disableDrag?: boolean;
  };
  selectable?: {
    selectedItems: string[];
    onSelectionChange: (itemId: string, checked: boolean) => void;
  };
  level: number;
  expands?: (item: NavigationItem) => React.ReactNode;
}

interface DragItem {
  id: string;
  type: string;
  sourceLevel: number; // Track the source level of dragged item
  originalItem: NavigationItem;
  parentId: string | null;
}

export function NavigationTree({
  className,
  items,
  editable,
  selectable,
  level = 0,
  expands,
}: NavigationTreeProps) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  return (
    <div className={cn(className)}>
      {items.length > 0 ? (
        items.map((item) => (
          <NavigationTreeItem
            key={item.id}
            allItems={items}
            item={item}
            editable={editable}
            level={level}
            expands={expands}
            selectable={selectable}
          />
        ))
      ) : (
        <div className="p-3 text-center text-gray-400">{t("noneDate")}</div>
      )}
    </div>
  );
}

function NavigationTreeItem({
  allItems,
  item,
  editable,
  level,
  expands,
  selectable,
}: NavigationTreeItemProps) {
  const dropContainerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState<
    "before" | "after" | "inside" | null
  >(null);

  const { site } = useSite();
  const siteEndpoint = `${process.env.NODE_ENV === "production" ? "https" : "http"}://${site?.basic.domain}`;
  const maxLevel = editable?.maxLevel ?? 3;
  const readonly = !editable;
  const dragDisabled = readonly || editable?.disableDrag;
  // Drag and hover style for items
  const [isChildHoverTarget, setIsChildHoverTarget] = useState(false);
  const [isGroupHoverTarget, setIsGroupHoverTarget] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "NAVIGATION_ITEM",
    item: {
      id: item.id,
      type: "NAVIGATION_ITEM",
      sourceLevel: level,
      originalItem: item,
      parentId: item.parentId,
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !dragDisabled,
  });

  const findItemInTree = (
    items: NavigationItem[],
    itemId: string,
  ): NavigationItem | null => {
    for (const item of items) {
      if (item.id === itemId) return item;
      if (item.children) {
        const found = findItemInTree(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  };

  const isParentDroppingIntoChild = (
    parent: NavigationItem,
    child: NavigationItem,
    allItems: NavigationItem[],
  ): boolean => {
    let currentParentId: string | null | undefined = child.parentId;
    while (currentParentId) {
      if (currentParentId === parent.id) {
        return true;
      }
      const nextParent = findItemInTree(allItems, currentParentId);
      if (!nextParent) break;
      currentParentId = nextParent.parentId;
    }
    return false;
  };

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop({
    accept: "NAVIGATION_ITEM",
    drop: (dragItem: DragItem, monitor) => {
      if (dragDisabled || !dragPosition) return;
      const didDrop = monitor.didDrop();
      if (didDrop) return;

      editable?.onMoveItem(dragItem.id, item.id, dragPosition);
      setDragPosition(null);
    },
    hover: (dragItem: DragItem, monitor) => {
      if (
        dragDisabled ||
        !dropContainerRef.current ||
        dragItem.id === item.id
      ) {
        return;
      }

      // 指示線: 拖曳的是父層，滑鼠停在一個子層上，顯示整組的下線
      const dragHasChildren = (dragItem.originalItem.children?.length ?? 0) > 0;
      const isParentOverChild = dragHasChildren && !!item.parentId;
      if (isParentOverChild) {
        setIsChildHoverTarget(isParentOverChild);
      } else {
        setIsChildHoverTarget(false);
      }

      // --- 1. 計算滑鼠位置 (不變) ---
      const hoverBoundingRect =
        dropContainerRef.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // --- 2. 收集所有判斷所需的資訊 ---
      // 規則2：父不能進自己的子孫
      const parentIntoChild = isParentDroppingIntoChild(
        dragItem.originalItem,
        item,
        allItems,
      );
      // 規則3：不能超過最大層級
      const isExceedingMaxLevel = level >= maxLevel - 1;
      // 規則4：子不能進子 (當前 hover 目標是子層，且拖曳的也是子層)
      const isChildIntoChild = !!(dragItem.parentId && item.parentId);
      // 規則5：父不能進子 (當前 hover 目標是子層，且拖曳的是父層)
      const isParentIntoChild = !!(!dragItem.parentId && item.parentId);

      // --- 3. 根據滑鼠位置和規則，決定最終的 dragPosition ---
      const HEADER_HEIGHT_PX = 35;
      let newPosition: "before" | "after" | "inside" | null = null;
      if (hasChildren && !item.parentId) {
        // 情境：目標是頂層父層且有子
        if (hoverClientY < 8) {
          newPosition = "before";
        } else if (
          hoverClientY > HEADER_HEIGHT_PX - 8 &&
          hoverClientY < HEADER_HEIGHT_PX
        ) {
          newPosition = "after";
        } else if (hoverClientY < HEADER_HEIGHT_PX) {
          newPosition = "inside";
        } else {
          // 已經超過標頭，但還在整個 droppable 區域內，保持 inside 意圖，讓 item 進入子清單。
          newPosition = "inside";
        }
      } else {
        // 情境：目標是子層，或目標是頂層父但沒有子
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        if (hoverClientY < hoverMiddleY * 0.5) {
          newPosition = "before";
        } else if (hoverClientY > hoverMiddleY * 1.5) {
          newPosition = "after";
        } else {
          newPosition = "inside";
        }
      }

      // 指示線: 父有子拖動樣式，當目標是頂層父層時，才考慮 Group Target 效果
      let isGroupTarget = false;
      // 條件 A: 拖曳者是父層 (有子)
      const isDragParent = dragHasChildren;
      // 條件 B: 目標是頂層父層 (!item.parentId)
      const isTargetRootParent = !item.parentId;
      // 條件 C: 滑鼠在目標父層的標頭區域內 (例如 < 35px)
      const isMouseInTargetHeader = hoverClientY < HEADER_HEIGHT_PX;

      if (isTargetRootParent) {
        // 情境 1: 父拖父 (最需要穩定的情境)
        if (isDragParent && isMouseInTargetHeader) {
          isGroupTarget = true;
        }
        // 情境 2: 任何項目拖曳到頂層父層的 before/after 區域 (確保子拖到父的 before/after 也有回饋)
        else if (
          !isDragParent &&
          (newPosition === "before" || newPosition === "after")
        ) {
          const isChildToParentBefore =
            !dragHasChildren && newPosition === "before";
          if (!isChildToParentBefore) {
            // 只有在 after 區域 (或 future other conditions) 時，才觸發 Group Target
            isGroupTarget = true;
          }
        }
      }

      setIsGroupHoverTarget(isGroupTarget);

      // --- 4. 如果意圖是 'inside'，則檢查所有無效規則 ---
      if (newPosition === "inside") {
        const isInvalidInsideMove =
          (dragHasChildren && !item.parentId) || // 父有子，想拖入另一個父
          parentIntoChild || // 父想拖入自己的子孫
          isExceedingMaxLevel || // 超出最大層級
          isChildIntoChild || // 子想拖入另一個子
          isParentIntoChild; //規則：父想拖入子

        if (isInvalidInsideMove) {
          // 如果是無效的 inside，則自動修正為 'after'
          newPosition = "after";
        }
      }

      // --- 5. 最後，更新狀態 ---
      setDragPosition(newPosition);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop:
        monitor.canDrop() &&
        !dragDisabled &&
        // Prevent dropping inside if it would exceed maxLevel
        !(dragPosition === "inside" && level >= maxLevel - 1),
      draggedItem: monitor.getItem() as DragItem | null,
    }),
  });

  // Connect drag and drop refs
  if (!dragDisabled) {
    drag(dragHandleRef);
    drop(dropContainerRef);
  }

  useEffect(() => {
    if (!isOver) {
      setIsChildHoverTarget(false);
      setIsGroupHoverTarget(false);
    }
  }, [isOver]);

  const draggedItemHasChildren = draggedItem
    ? (draggedItem.originalItem.children?.length ?? 0) > 0
    : false;
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectable?.selectedItems.includes(item.id);

  const getLinkHref = (item: NavigationItem): string | null => {
    const { linkType, link } = item;
    const siteEndpoint = process.env.NEXT_PUBLIC_SITE_ENDPOINT;

    if (!link) {
      return null;
    }

    switch (linkType) {
      case "link":
        return link.startsWith("/") ? `${siteEndpoint}${link}` : link;

      case "page":
        return link.indexOf("/") === -1
          ? `/dashboard/pages/${item.link}`
          : `/dashboard/pages/${item.link}/edit`;

      case "article":
        return link.indexOf("/") === -1
          ? `/dashboard/article/${item.link}/post`
          : `/dashboard/article/${item.link.split("/")[0]}/post/${item.link.split("/")[1]}`;

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-200 relative border-mute-300 border-t first:border-t-0",
        level === 0 && "pr-3",
        isDragging && "opacity-30 scale-95 rotate-1 shadow-lg",
        !item.parentId && "parent-item",
        isOver && canDrop && !isDragging && "bg-muted",
        hasChildren &&
          !isDragging &&
          "has-[.is-child-hover-target]:bg-muted has-[.is-child-hover-target]:border-b-2",
        hasChildren &&
          isGroupHoverTarget &&
          cn(
            dragPosition === "before" && "border-t-2 border-blue-500 ",
            dragPosition === "after" && "border-b-2 border-blue-500 ",
          ),
        // level > 0 && 'before:absolute before:block before:border-l-2 before:border-gray-300 before:w-[10px] before:h-full before:top-[-10px] before:left-[21px] last:before:border-b-2 last:before:rounded-bl-sm last:before:h-[70%] last:top-[50%]',
        // level > 0 && 'bg-muted/80'
      )}
      ref={dropContainerRef}
    >
      {/* Drop indicator lines*/}
      {isOver &&
        canDrop &&
        dragPosition === "before" &&
        !draggedItemHasChildren && (
          <div className="drop-top h-0.5 bg-blue-500 mx-4 -mb-0.5 relative z-10" />
        )}
      <div
        className={cn(
          "flex items-center py-3 pl-3 min-h-11 group transition-colors",
          level > 0 && "is-child-item",
          isChildHoverTarget && "is-child-hover-target",
          isOver &&
            canDrop &&
            dragPosition === "inside" &&
            "bg-mute-200 border-mute-300",
        )}
      >
        {/* Drag Handle */}
        {!readonly && !editable?.disableDrag && (
          <div className="cursor-move" ref={dragHandleRef}>
            <Icon
              icon="lsicon:drag-outline"
              className="size-5 text-gray-500 cursor-move hover:bg-accent"
            />
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
        <div className="flex-1 min-w-0 flex items-center gap-1 ml-3">
          <span className="flex items-center text-sm font-medium truncate gap-3">
            <div className="flex items-center gap-1.5">
              {item.icon && (
                <Avatar className="size-4 rounded-none bg-transparent">
                  <AvatarImage src={item.icon} alt={`${item.title}-icon`} />
                </Avatar>
              )}
              {item.title}
            </div>
            <span
              className="capitalize text-gray-500 text-xs">
              - {item.linkType}
            </span>
            {item.linkType && item.link !== "none" && (
              <Link
                target={item.linkType === "link" ? "_blank" : undefined}
                className="text-muted-foreground"
                href={getLinkHref(item) || "#"}
              >
                <Icon
                  icon="material-symbols-light:link-rounded"
                  className="size-5"
                />
              </Link>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center transition-opacity">
          <>{expands && expands(item)}</>
          {/* Enable/Disable Switch */}
          {editable?.onToggleEnabled && (
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-gray-500 cursor-move"
              onClick={() => editable.onToggleEnabled?.(item.id, !item.enabled)}
            >
              {item.enabled ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editable?.onEditItem(item)}
            className="px-2 text-gray-500"
          >
            <Edit2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editable?.onDeleteItem(item.id)}
            className="px-2 border-red-300 text-red-600/70 hover:bg-red-50 hover:border-red-400"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Drop indicator line after */}
      {isOver &&
        canDrop &&
        dragPosition === "after" &&
        !hasChildren &&
        !(draggedItemHasChildren && !!item.parentId) && (
          <div className="drop-bottom h-0.5 bg-blue-500 mx-4 -mt-0.5 relative z-10" />
        )}
      {/* Children */}
      {hasChildren && item.children && (
        <NavigationTree
          className="ml-10 mb-2 bg-muted/80 border-mute-300 rounded-md"
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
