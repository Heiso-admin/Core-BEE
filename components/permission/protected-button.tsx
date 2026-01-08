import { Button } from "@heiso/core/components/ui/button";
import type { permissionsConfig } from "@heiso/core/config/permissions";
import { usePermission } from "@heiso/core/hooks/use-permission";

type ProtectedButtonProps =
  | {
      className?: string;
      resource?: undefined;
      action?: undefined;
      asChild?: boolean;
      children?: React.ReactNode;
    }
  | {
      className?: string;
      resource: (typeof permissionsConfig)[number]["resource"];
      action: (typeof permissionsConfig)[number]["action"];
      asChild?: boolean;
      children?: React.ReactNode;
    };

export const ProtectedButton = ({
  className,
  resource,
  action,
  children,
  asChild = false,
  ...props
}: ProtectedButtonProps) => {
  const allowed = usePermission({
    resource,
    action,
  });
  if (!allowed) return null;

  return (
    <Button className={className} asChild={asChild} {...props}>
      {children}
    </Button>
  );
};
