// import { Fragment } from 'react';
import { usePermission } from "@/hooks/use-permission";

export const ProtectedArea = ({
  resource,
  action = "view",
  tips,
  children,
}: {
  resource: string;
  action?: string;
  // className?: string;
  tips?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const allowed = usePermission({
    resource,
    action,
  });
  if (!allowed) {
    return tips ? (
      <div className="border border-dashed rounded-md w-full h-20 flex flex-col items-center justify-center text-xs text-muted-foreground">
        {tips}
      </div>
    ) : null;
  }

  return <>{children}</>;
};
