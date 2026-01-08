import type { Permission } from "./permission";

export interface RouteConfig {
  path: string;
  component?: React.ComponentType; // Optional: Component to render
  layout?: React.ComponentType; // Optional: Layout wrapper
  meta?: {
    title?: string;
    icon?: string;
    public?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: Required for flexible schema
    [key: string]: any;
  };
  children?: RouteConfig[];
}

export interface MenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  group?: string; // e.g. 'functions', 'settings'
  permissions?: string[]; // Required permissions to view
  order?: number;
  children?: MenuItem[];
}

export interface ModuleContext {
  // Methods to interact with the Core host (e.g., registering additional hooks, accessing store)
  registerRoute: (route: RouteConfig) => void;
  registerMenu: (menu: MenuItem) => void;
  registerPermission: (permission: Permission) => void;
  // ... future extensibility (e.g. event bus, store)
}

export interface CMSModule {
  id: string;

  // 1. Static Capabilities Declaration
  // Used for static analysis, permission budgeting, and caching.
  capabilities?: {
    routes?: RouteConfig[];
    menus?: MenuItem[];
    permissions?: Permission[];
    // biome-ignore lint/suspicious/noExplicitAny: Required for flexible localization
    locales?: Record<string, any>;
  };

  // 2. Dynamic Registration Logic
  // Used for event listeners, dependency injection, or conditional initialization.
  register?: (ctx: ModuleContext) => void;
}
