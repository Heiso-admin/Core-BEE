import { CMSModule, ModuleContext, RouteConfig, MenuItem } from "../types/module";
import { Permission } from "../types/permission";

class ModuleRegistry {
    private modules: Map<string, CMSModule> = new Map();
    private routes: RouteConfig[] = [];
    private menus: MenuItem[] = [];
    private permissions: Permission[] = [];

    register(module: CMSModule) {
        if (this.modules.has(module.id)) {
            console.warn(`Module ${module.id} is already registered.`);
            return;
        }

        this.modules.set(module.id, module);

        // 1. Process Static Capabilities
        if (module.capabilities) {
            if (module.capabilities.routes) {
                this.routes.push(...module.capabilities.routes);
            }
            if (module.capabilities.menus) {
                this.menus.push(...module.capabilities.menus);
            }
            if (module.capabilities.permissions) {
                this.permissions.push(...module.capabilities.permissions);
            }
        }

        // 2. Execute Dynamic Registration Logic
        if (module.register) {
            const context: ModuleContext = {
                registerRoute: (route) => this.routes.push(route),
                registerMenu: (menu) => this.menus.push(menu),
                registerPermission: (permission) => this.permissions.push(permission),
            };
            module.register(context);
        }
    }

    getRoutes() {
        return this.routes;
    }

    getMenus() {
        return this.menus.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    getPermissions() {
        return this.permissions;
    }
}

export const moduleRegistry = new ModuleRegistry();
