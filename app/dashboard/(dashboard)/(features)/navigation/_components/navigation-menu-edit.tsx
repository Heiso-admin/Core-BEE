"use client";

import { Plus, RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import {
  NavigationForm,
  type NavigationItem,
  NavigationTree,
  type UpdateInstruction,
} from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TNavigation } from "@/lib/db/schema";
import {
  addMenu,
  removeMenu,
  toggleMenuEnabled,
  updateMenu,
  updateMenuOrder,
} from "../_server/navigation-menus.service";
import { ConfirmRemove } from "./confirm-remove";
import { NavigationManager } from "./navigation-manager";
import { CaptionTotal } from "@/components/ui/caption";

export function NavigationMenuEdit({
  navId,
  items,
  count,
  navList,
  firstList,
}: {
  navId: string;
  items: NavigationItem[];
  count: number;
  navList: TNavigation[];
  firstList?: NavigationItem[];
}) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const currentNav = navList?.find((n) => n.id === navId) ?? {
    id: navId,
    name: t("main"),
  };

  const [navigationItems, setNavigationItems] =
    useState<NavigationItem[]>(items);
  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null);
  const [openCreateOrEditPanel, setOpenCreateOrEditPanel] = useState(false);

  const [isRemovePending, startRemoveTransition] = useTransition();
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const [removeItemId, setRemoveItemId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [tempOrderList, setTempOrderList] = useState<UpdateInstruction[][]>([]);

  const sortNavigationTree = useCallback((list: NavigationItem[]): NavigationItem[] => {
    const sortedItems = list.map((item) => {
      const newItem = { ...item };

      if (newItem.children && newItem.children.length > 0) {
        newItem.children = sortNavigationTree(newItem.children);
      }

      return newItem;
    });

    sortedItems.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });

    return sortedItems;
  }, []);

  useEffect(() => {
    setNavigationItems(sortNavigationTree(items));
    setTempOrderList([]);
  }, [items, sortNavigationTree]);

  const getTotalCount = (items: NavigationItem[]): number => {
    let count = 0;
    for (const item of items) {
      count += 1;
      if (item.children && item.children.length > 0) {
        count += getTotalCount(item.children);
      }
    }
    return count;
  };

  const handleAddItem = () => {
    setOpenCreateOrEditPanel(true);
  };

  const handleEditItem = (item: NavigationItem) => {
    setOpenCreateOrEditPanel(true);
    setSelectedItem(item);
  };

  const handleDeleteItem = async (itemId: string) => {
    setRemoveItemId(itemId);
    setOpenRemoveConfirm(true);
  };

  const handleToggleEnabled = async (itemId: string, enabled: boolean) => {
    try {
      await toggleMenuEnabled(itemId, enabled);
      // Update local state
      const updateItemEnabled = (items: NavigationItem[]): NavigationItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, enabled };
          }
          if (item.children) {
            return { ...item, children: updateItemEnabled(item.children) };
          }
          return item;
        });
      };
      setNavigationItems(updateItemEnabled(navigationItems));
    } catch (error) {
      console.error("Failed to toggle menu enabled status:", error);
    }
  };

  const handleRemove = () => {
    if (!removeItemId) return;

    setOpenRemoveConfirm(true);
    startRemoveTransition(async () => {
      await removeMenu(removeItemId);
      setOpenRemoveConfirm(false);
    });
  };

  const updateNavigationItems = (
    originalItems: NavigationItem[],
    updates: UpdateInstruction[],
  ): NavigationItem[] => {
    const itemMap = new Map<string, NavigationItem>();

    function flatten(items: NavigationItem[]) {
      for (const item of items) {
        const newItem: NavigationItem = { ...item };
        delete newItem.children;
        itemMap.set(newItem.id, newItem);

        if (item.children) {
          flatten(item.children);
        }
      }
    }
    flatten(originalItems);

    for (const update of updates) {
      const item = itemMap.get(update.id);
      if (item) {
        item.parentId = update.parentId;
        item.order = update.order;
      }
    }

    const childrenMap = new Map<string | null, NavigationItem[]>();
    for (const item of itemMap.values()) {
      const parentId: string | null = item.parentId ?? null;

      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(item);
    }

    function buildTree(parentId: string | null): NavigationItem[] {
      const items = childrenMap.get(parentId) || [];
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (const item of items) {
        const children = buildTree(item.id);
        if (children.length > 0) {
          item.children = children;
        } else {
          delete item.children;
        }
      }
      return items;
    }
    return buildTree(null);
  };

  const flattenTreeToUpdates = (
    items: NavigationItem[],
  ): UpdateInstruction[] => {
    const flatList: UpdateInstruction[] = [];

    function recursiveFlatten(
      currentItems: NavigationItem[],
      parentId: string | null = null,
    ) {
      currentItems.forEach((item, index) => {
        flatList.push({
          id: item.id,
          parentId: parentId,
          order: index,
        });
        if (item.children && item.children.length > 0) {
          recursiveFlatten(item.children, item.id);
        }
      });
    }

    recursiveFlatten(items, null);
    return flatList;
  };

  // 根据ID查找节点
  const findItemById = (
    items: NavigationItem[],
    id: string,
  ): NavigationItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 查找同级节点
  const findSiblings = (
    items: NavigationItem[],
    id: string,
  ): NavigationItem[] => {
    // 如果是顶级节点
    const item = findItemById(items, id);
    if (!item?.parentId) return items;

    // 查找父节点的children
    const parent = findItemById(items, item.parentId);
    return parent?.children || [];
  };

  const handleMoveItem = (
    dragId: string,
    hoverId: string,
    position: "before" | "after" | "inside",
  ) => {
    startTransition(async () => {
      const dragItem = findItemById(navigationItems, dragId);
      const hoverItem = findItemById(navigationItems, hoverId);

      if (!dragItem || !hoverItem) return;
      let effectivePosition = position;
      let effectiveHoverItem = hoverItem;
      const dragHasChildren = (dragItem.children?.length ?? 0) > 0;

      // 條件判斷區塊
      // 1. 父有子 → 只能順序 (禁止 inside)
      if (
        !dragItem.parentId &&
        effectiveHoverItem.parentId &&
        dragHasChildren
      ) {
        console.warn("偵測到父層與子層互動，重新導向至父層...");
        const parentId = effectiveHoverItem.parentId;
        if (!parentId) {
          console.error("子層沒有 parentId，操作取消");
          return;
        }

        const hoverParent = findItemById(navigationItems, parentId);
        if (hoverParent) {
          // 父有子，目標為子，更換成移動到父層的後方
          effectiveHoverItem = hoverParent;
          effectivePosition = "after";
        } else {
          console.error(`找不到父層 ${parentId}，取消移動`);
          return;
        }
      } else if (
        dragItem.parentId &&
        hoverItem.parentId &&
        position === "inside"
      ) {
        effectivePosition = "after";
      } else if (dragHasChildren && effectivePosition === "inside") {
        effectivePosition = "after";
      }

      const updates: UpdateInstruction[] = [];

      // 允許 子 → 父 之間的 inside
      if (effectivePosition === "inside") {
        updates.push({
          id: dragId,
          parentId: effectiveHoverItem.id,
          order: effectiveHoverItem.children?.length || 0,
        });
      } else {
        // 執行 before/after 操作
        const targetSiblings = findSiblings(
          navigationItems,
          effectiveHoverItem.id,
        );
        const newSiblings = targetSiblings.filter((item) => item.id !== dragId);
        const hoverIndex = newSiblings.findIndex(
          (item) => item.id === effectiveHoverItem.id,
        );

        // 一個預期外的邊界
        if (hoverIndex === -1 && newSiblings.length > 0) {
          return;
        }

        const insertAtIndex =
          effectivePosition === "before" ? hoverIndex : hoverIndex + 1;
        newSiblings.splice(insertAtIndex, 0, dragItem);

        const newParentId = effectiveHoverItem.parentId;
        newSiblings.forEach((item, index) => {
          updates.push({
            id: item.id,
            parentId: newParentId,
            order: index,
          });
        });
      }

      console.log("updates:", updates);
      setTempOrderList((prev) => [...prev, updates]);
      setNavigationItems((prev) => updateNavigationItems(prev, updates));
    });
  };

  const handleSaveOrder = () => {
    const finalUpdates = flattenTreeToUpdates(navigationItems);

    if (finalUpdates.length === 0) return;
    toast.info(t("order.saveing"));

    startTransition(async () => {
      try {
        // 扁平列表
        await updateMenuOrder(finalUpdates);
        toast.success(t("order.success"));
      } catch (error) {
        toast.error(t("order.failed"));
      }
    });
  };

  return (
    <div className="w-full container mx-auto flex flex-row">
      <NavigationManager
        className="main-section-item layout-split-pane"
        navId={navId}
        navList={navList}
        itemsList={firstList ?? []}
      /> 
      <div className="main-section-item grow w-full overflow-x-hidden overflow-y-auto pt-4 pr-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mx-1">
          <CaptionTotal title={currentNav.name ?? t("title")} total={getTotalCount(navigationItems)} />
          <div className="flex item-center gap-3">
            {tempOrderList.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNavigationItems(sortNavigationTree(items));
                    setTempOrderList([]);
                  }}
                >
                  <RotateCcw /> {t("order.reset")}
                </Button>
                <Button variant="outline" onClick={handleSaveOrder}>
                  <Save className="size-4 gap-0" />
                  {t("order.save")}
                </Button>
              </>
            )}
            <Button onClick={handleAddItem}>
              <Plus className="size-4 gap-0" />
              {t("addNewItemButton")}
            </Button>
          </div>
        </div>
        <DndProvider backend={HTML5Backend}>
        {/* Navigation Tree */}
          <div className="rounded-lg bg-background/95 drop-shadow-sm">
            <NavigationTree
              items={navigationItems}
              editable={{
                onEditItem: handleEditItem,
                onDeleteItem: handleDeleteItem,
                onMoveItem: handleMoveItem,
                onToggleEnabled: handleToggleEnabled,
              }}
            />
          </div>
        </DndProvider>
      </div>

      {/* Form Panel */}
      <CreateOrEditItemForm
        navId={navId}
        open={openCreateOrEditPanel}
        count={count}
        onClose={() => {
          setSelectedItem(null);
          setOpenCreateOrEditPanel(false);
        }}
        data={selectedItem}
        navigationItems={navigationItems}
      />

      <ConfirmRemove
        title={t("deleteNavigation")}
        content={t("deleteNavigationConfirm")}
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        pending={isRemovePending}
        onConfirm={handleRemove}
      />
    </div>
);
}

// AddDialog extracted to './add-navigation-dialog'
function CreateOrEditItemForm({
  navId,
  open = false,
  count,
  onClose,
  data,
  navigationItems,
}: {
  navId: string;
  open?: boolean;
  count: number;
  onClose?: () => void;
  data?: NavigationItem | null;
  navigationItems: NavigationItem[];
}) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const [isSaving, startTransition] = useTransition();
  const [order, setOrder] = useState(count + 1);
  const handleSaveItem = (item: Partial<NavigationItem>) => {
    startTransition(async () => {
      if (data?.id) {
        await updateMenu({
          menu: {
            ...data,
            ...item,
          },
          revalidateUri: "./menu",
        });
      } else {
        await addMenu({
          navId,
          menu: {
            ...item,
            order,
          },
          revalidateUri: "./navigation",
        });
      }

      if (item.id) setOrder(order + 1);
      onClose?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data ? t("editItem") : t("addNewItem")}</DialogTitle>
        </DialogHeader>
        <NavigationForm
          item={data}
          isPending={isSaving}
          onSave={handleSaveItem}
          onCancel={() => onClose?.()}
          navigationItems={navigationItems}
        />
      </DialogContent>
    </Dialog>
  );
}
