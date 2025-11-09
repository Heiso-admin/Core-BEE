import { Button } from "@/components/ui/button";
import type { permissionsConfig } from '@/config/permissions';
import { usePermission } from '@/hooks/use-permission';

export const ProtectedButton = ({
  className,
  resource,
  action = 'view',
  children,
  asChild = false,
  ...props
}: {
  className?: string;
  resource: (typeof permissionsConfig)[number]['resource'];
  action?: (typeof permissionsConfig)[number]['action'];
  asChild?: boolean;
  children?: React.ReactNode;
}) => {
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
