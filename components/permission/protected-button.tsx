import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";

export const ProtectedButton = ({
  className,
  resource,
  action = "click",
  children,
  asChild = false,
  ...props
}: {
  className?: string;
  resource: string;
  action?: string;
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
