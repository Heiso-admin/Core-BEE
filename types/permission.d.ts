export interface Permission {
  resource: string; // e.g., "dashboard.button.addUser"
  action: string; // e.g., ["view", "click"]
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  roles: string[];
  extraPermissions?: Permission[];
}
