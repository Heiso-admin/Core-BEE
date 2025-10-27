import type { ReactNode } from "react";

type NavItem = {
  id: string;
  title: string | null;
  path: string | null;
  icon: string | null;
  hasNew?: boolean;
};

export type Navigation = {
  rootPath: string;
  items: Array<NavItem | NavItem[]>;
};

type SubNavItem = {
  title: string;
  href: string;
  target?: string;
};

type SubNavGroup = {
  title: string;
  items: SubNavItem[];
};

export type SubNavProps = {
  rootPath: string;
  className?: string;
  title: string;
  groups: SubNavGroup[];
};

export interface BreadcrumbProps {
  items: {
    title: ReactNode;
    link?: string;
    isDropdown?: boolean;
    dropdownItems?: {
      title: string;
      link: string;
    }[];
    icon?: ReactNode;
    className?: string;
  }[];
  className?: string;
}
