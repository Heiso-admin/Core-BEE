"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { MenuForm, type MenuItem, MenuTree } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  addMenu,
  removeMenu,
  updateMenu,
  updateMenusOrder,
} from "../_server/menu.service";
import { ConfirmRemove } from "./confirm-remove";

export function MenuEdit({
  items,
  count,
}: {
  items: MenuItem[];
  count: number;
}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items);
  const [isDeleting, startTransition] = useTransition();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedParentItem, setSelectedParentItem] = useState<MenuItem | null>(
    null,
  );
  const [openCreateOrEditPanel, setOpenCreateOrEditPanel] = useState(false);
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const [removeItemId, setRemoveItemId] = useState("");
  const t = useTranslations('devCenter.menu');

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  const handleAddItem = () => {
    setOpenCreateOrEditPanel(true);
    setSelectedParentItem(null);
  };

  const handleAddSubItem = (item: MenuItem) => {
    setOpenCreateOrEditPanel(true);
    setSelectedParentItem(item);
  };

  const handleEditItem = (item: MenuItem) => {
    setOpenCreateOrEditPanel(true);
    setSelectedItem(item);
    setSelectedParentItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setOpenRemoveConfirm(true);
    setRemoveItemId(itemId);
  };

  const handleRemoveItem = async () => {
    startRemoveTransition(async () => {
      await removeMenu({ id: removeItemId });
    });
  };

  const handleMoveItem = (
    dragId: string,
    hoverId: string,
    position: "before" | "after" | "inside",
  ) => {
    let draggedItem: MenuItem | null = null;
    let draggedItemParentPath: string[] = [];

    const findDraggedItem = (
      items?: MenuItem[],
      path: string[] = [],
    ): boolean => {
      if (!items) return true;

      for (let i = 0; i < items.length; i++) {
        if (items[i].id === dragId) {
          draggedItem = { ...items[i] };
          draggedItemParentPath = [...path];
          return true;
        }
        if (
          items[i].children &&
          findDraggedItem(items[i].children, [...path, items[i].id])
        ) {
          return true;
        }
      }
      return false;
    };

    findDraggedItem(menuItems);

    if (!draggedItem) return;

    const removeItem = (items: MenuItem[], path: string[]): MenuItem[] => {
      if (path.length === 0) {
        return items.filter((item) => item.id !== dragId);
      }

      const parentId = path[0];
      const restPath = path.slice(1);

      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: removeItem(item.children || [], restPath),
          };
        }
        return item;
      });
    };

    let newItems = removeItem([...menuItems], draggedItemParentPath);

    const insertItem = (
      items: MenuItem[],
      targetId: string,
      position: "before" | "after" | "inside",
    ): MenuItem[] => {
      if (position === "inside") {
        return items.map((item) => {
          if (item.id === targetId) {
            const updatedItem = { ...draggedItem!, parentId: targetId };
            return {
              ...item,
              children: [...(item.children || []), updatedItem],
            };
          }

          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: insertItem(item.children, targetId, position),
            };
          }

          return item;
        });
      } else {
        const result: MenuItem[] = [];

        for (let i = 0; i < items.length; i++) {
          if (items[i].id === targetId) {
            const updatedDraggedItem = {
              ...draggedItem!,
              parentId: items[i].parentId,
            };

            if (position === "before") {
              result.push(updatedDraggedItem);
              result.push(items[i]);
            } else {
              result.push(items[i]);
              result.push(updatedDraggedItem);
            }
          } else {
            const newItem = { ...items[i] };
            if (newItem.children && newItem.children.length > 0) {
              newItem.children = insertItem(
                newItem.children,
                targetId,
                position,
              );
            }
            result.push(newItem);
          }
        }

        return result;
      }
    };

    newItems = insertItem(newItems, hoverId, position);
    setMenuItems(newItems);
  };

  return (
    <div className="container mx-auto p-6 mb-15">
      <div className="">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{t("title")}</h1>
            <span className="text-sm">{t("total", { count })}</span>
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.add.button")}
          </Button>
        </div>

        <div className="rounded-lg border px-4 py-6">
          <MenuTree
            items={menuItems}
            editable={{
              onAddItem: handleAddSubItem,
              onEditItem: handleEditItem,
              onDeleteItem: handleDeleteItem,
              onMoveItem: handleMoveItem,
            }}
          />

          <CreateOrEditItemForm
            parent={selectedParentItem}
            open={openCreateOrEditPanel}
            count={count}
            onClose={() => {
              setSelectedItem(null);
              setOpenCreateOrEditPanel(false);
            }}
            data={selectedItem}
          />
        </div>
      </div>

      <ConfirmRemove
        title={t("actions.remove.title")}
        content={t("actions.remove.content")}
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        pending={isRemovePending}
        onConfirm={handleRemoveItem}
      />
    </div>
  );
}

function CreateOrEditItemForm({
  parent = null,
  open = false,
  count,
  onClose,
  data,
}: {
  parent?: MenuItem | null;
  open?: boolean;
  count: number;
  onClose?: () => void;
  data?: MenuItem | null;
}) {
  const [isSaving, startTransition] = useTransition();
  const [order, setOrder] = useState(count + 1);
  const t = useTranslations('devCenter.menu');

  const handleSaveItem = (item: Partial<MenuItem>) => {
    startTransition(async () => {
      if (data?.id) {
        await updateMenu({
          menu: {
            ...data,
            ...item,
            ...(parent && { parentId: parent.id }),
          },
          revalidateUri: "./menu",
        });
      } else {
        await addMenu({
          menu: {
            ...item,
            order,
            ...(parent && { parentId: parent.id }),
          },
          revalidateUri: "./menu",
        });
      }

      if (item.id) setOrder(order + 1);
      onClose?.();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {data ? t("actions.edit.title") : t("actions.add.title")}
            {data?.parentId &&
              t("actions.add.parent_title", { title: data?.title })}
          </SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <MenuForm
            item={data}
            onSave={handleSaveItem}
            onCancel={() => onClose?.()}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
