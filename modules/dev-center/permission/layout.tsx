import { SubNav } from "@/components/primitives";

export default function PermissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subNavGroups = [
    {
      title: "PERMISSION",
      items: [],
    },
  ];

  return (
    <div className="flex w-full h-full">
      <SubNav
        rootPath={'/dev-center/permission'}
        title="Permission"
        groups={subNavGroups}
        className="flex-none"
      />
      <div className="grow w-full h-full overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
