import { NavigationItem } from "@/components/primitives";

// 對 Navigation 列表進行排序的輔助函式
export const sortNavigationTree = (list: NavigationItem[]): NavigationItem[]=>{
    const sortedItems = list.map(item => {
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
  };

// 將樹狀結構扁平化為一維陣列
export function flattenTree(
  items: NavigationItem[],
  parentId: string | null = null,
  depth = 0
): (NavigationItem & { parentId: string | null; depth: number; index: number })[] {
  return items.reduce((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.children || [], item.id, depth + 1),
    ];
  }, [] as (NavigationItem & { parentId: string | null; depth: number; index: number })[]);
}
