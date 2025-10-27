export interface MenuItem {
  id: string;
  title: string;
  path: string | null;
  group?: string | null;
  icon?: string | null;
  order: number | null;
  parentId?: string | null;
  children?: MenuItem[];
}

export * from "./menu-form";
export * from "./menu-tree";
