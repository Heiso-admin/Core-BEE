import { useEffect, useState } from "react";
import { usePermissionContext } from "@/providers/permission";

export function usePermission({
  resource,
  action,
}: {
  resource: string;
  action: string;
}): boolean | null {
  const { can } = usePermissionContext();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    can({ permissions: [{ resource, action }] }).then((res) => {
      setAllowed(res[0]);
    });
  }, [can, resource, action]);

  return allowed;
}

export function usePermissions({
  permissions,
}: {
  space: 'General' | 'Organization' | 'Project';
  permissions: {
    resource: string;
    action: string;
  }[];
}): (boolean | null)[] {
  const { can } = usePermissionContext();
  const [allowedList, setAllowedList] = useState<(boolean | null)[]>(
    new Array(permissions.length).fill(null)
  );

  useEffect(() => {
    const checkPermissions = async () => {
      const results = await can({ permissions });
      setAllowedList(results);
    };

    checkPermissions();
  }, [can, permissions]);

  return allowedList;
}

// TODO: Consider adding feature gate in the future
// export function useFeatureGate(
// 	userId: string,
// 	feature: string,
// ): boolean | null {
// 	const [allowed, setAllowed] = useState<boolean | null>(null);
// 	const [resource, action = "use"] = feature.split(".");

// 	useEffect(() => {
// 		can(userId, resource, action).then(setAllowed);
// 	}, [userId, feature, resource, action]);

// 	return allowed;
// }
