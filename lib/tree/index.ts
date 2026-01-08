export function recursiveList<
  T extends { id: string; parentId: string | null },
>(data: T[], parentId: string | null = null): (T & { children?: T[] })[] {
  const children = data.filter((item) => item.parentId === parentId);
  const result = children.map((item) => {
    const children = recursiveList(data, item.id);
    return {
      ...item,
      children: children.length > 0 ? children : undefined,
    };
  });
  return result;
}

export function groupByItems<
  T extends { id: string; parentId: string | null; group?: string | null },
>(
  tree: (T & { children?: (T & { children?: T[] })[] })[],
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  function traverse(node: T & { children?: (T & { children?: T[] })[] }) {
    // Add current node to group if it has a group property
    if (node.group) {
      if (!groups[node.group]) {
        groups[node.group] = [];
      }
      groups[node.group].push(node);
    }

    // Recursively traverse children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        traverse(child);
      });
    }
  }

  // Start traversal from root nodes
  tree.forEach((node) => {
    traverse(node);
  });

  return groups;
}

export function findMenus<T extends { id: string; parentId: string | null }>(
  data: T[],
  rootId?: string | null,
  options?: { level?: number; traverse?: boolean },
): T[] {
  const result: T[] = [];

  function traverseNodes(currentId: string | null, currentLevel = 1) {
    const children = data.filter((item) => item.parentId === currentId);

    children.forEach((child) => {
      // If level is specified and we haven't reached it yet, or if traverse is true,
      // or if no options are specified, add the child
      if (
        !options?.level ||
        currentLevel <= options.level ||
        options.traverse
      ) {
        result.push(child);
      }

      // Continue traversing if:
      // 1. traverse option is true, or
      // 2. level is not specified, or
      // 3. we haven't reached the specified level yet
      if (
        options?.traverse ||
        !options?.level ||
        currentLevel < options.level
      ) {
        traverseNodes(child.id, currentLevel + 1);
      }
    });
  }

  traverseNodes(rootId ?? null);
  return result;
}

export function groupMenuItems<
  T extends {
    id: string;
    parentId: string | null;
    order: number | null;
    group?: string | null;
  },
>(items: T[]): (T | T[])[] {
  // First, group items by their group property
  const groupedMap = items.reduce(
    (acc, item) => {
      if (!item.group) {
        return acc;
      }
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );

  // Get ungrouped items
  const ungroupedItems = items.filter((item) => !item.group);

  // Sort groups internally and create final array
  const groupedArrays = Object.values(groupedMap).map((group) => {
    return [...group].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    });
  });

  // Combine ungrouped items and grouped arrays
  const result = [...ungroupedItems, ...groupedArrays];

  // Sort the final array
  return result.sort((a, b) => {
    const getMinOrder = (item: T | T[]) => {
      if (Array.isArray(item)) {
        return Math.min(...item.map((i) => i.order ?? Infinity));
      }
      return item.order ?? Infinity;
    };

    const orderA = getMinOrder(a);
    const orderB = getMinOrder(b);
    return orderA - orderB;
  });
}

export function findBreadcrumb<
  T extends { id: string; parentId: string | null; name: string },
>(categoryId: string, categories: T[]) {
  const allCategories = categories;

  // Find breadcrumb path by traversing categories
  const breadcrumb: Array<{ id: string; name: string }> = [];
  let currentId = categoryId;

  while (currentId) {
    const category = allCategories.find((cat) => cat.id === currentId);
    if (!category) break;

    breadcrumb.unshift({
      id: category.id,
      name: category.name,
    });

    currentId = category.parentId || "";
  }

  return breadcrumb;
}
