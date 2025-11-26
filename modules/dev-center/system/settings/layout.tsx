import { SubNav } from "@/components/primitives";

export default function PermissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subNavGroups = [
    {
      title: 'SETTING',
      items: [
        {
          title: 'Site SEO',
          href: '/site',
        },
        {
          title: 'General setting',
          href: '/general',
        },
      ],
    },
  ];

  return (
    <div className="flex w-full h-full">
      <SubNav
        rootPath={'/dev-center/settings'}
        title="Settings"
        groups={subNavGroups}
        className="flex-none"
      />
      <div className="grow w-full h-full overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
