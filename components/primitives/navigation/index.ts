export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  subTitle: string | null;
  icon?: string | null;
  linkType: string;
  link: string;
  group?: string | null;
  order: number | null;
  parentId?: string | null;
  children?: NavigationItem[];
  enabled?: boolean;
}

export interface UpdateInstruction {
  id: string;
  parentId: string | null | undefined;
  order: number;
}

export * from "./navigation-form";
export * from "./navigation-tree";
