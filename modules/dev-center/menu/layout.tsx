import { SubNav } from "@heiso/core/components/primitives";

export default function PermissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subNavGroups = [
    {
      title: "MENU",
      items: [
        // {
        //   title: 'Organization',
        //   href: '/organization',
        // },
        // {
        //   title: 'Project',
        //   href: '/project',
        // },
      ],
    },
  ];

  return (
    <div className="flex w-full h-full">
      <SubNav
        rootPath={"/dev-center/menu"}
        title="Menu"
        groups={subNavGroups}
        className="flex-none"
      />
      <div className="grow w-full h-full overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
