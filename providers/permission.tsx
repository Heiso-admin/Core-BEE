"use client";

import { getUserPermissions } from "@heiso/core/server/services/permission";
import type { UserPermission } from "@heiso/core/server/services/role";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Permission {
  resource: string;
  action: string;
}

interface PermissionCheck {
  permissions: Permission[];
}

export interface PermissionContextType {
  can: (params: PermissionCheck) => Promise<boolean[]>;
  role: string | null;
  refresh: () => Promise<void>;
}

const defaultContext: PermissionContextType = {
  can: async () => [],
  role: null,
  refresh: async () => {},
};

export const PermissionContext =
  createContext<PermissionContextType>(defaultContext);

export const usePermissionContext = () => useContext(PermissionContext);

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [role, setRole] = useState<string | null>(null);
  const [fullAccess, setFullAccess] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<
    UserPermission["permissions"] | null
  >(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const { role, fullAccess, permissions } = await getUserPermissions();
      console.log("role: ", role);
      setRole(role);
      setFullAccess(fullAccess);
      setPermissions(permissions);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions(null);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const can = useCallback(
    async ({
      permissions: permissionsList,
    }: PermissionCheck): Promise<boolean[]> => {
      if (fullAccess === true) return Array(permissionsList.length).fill(true);
      if (!permissions) return Array(permissionsList.length).fill(false);

      return permissionsList.map(({ resource, action }) =>
        permissions.some((p) => p.resource === resource && p.action === action),
      );
    },
    [fullAccess, permissions],
  );

  return (
    <PermissionContext.Provider
      value={{ can, role, refresh: fetchPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
