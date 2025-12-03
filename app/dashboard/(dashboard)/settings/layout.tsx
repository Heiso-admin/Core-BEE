import { SubNav } from "@/components/primitives";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subNavGroups = [
    {
      title: 'SETTINGS',
      items: [
        // {
        //   title: 'General Settings',
        //   href: `/general`,
        //   active: true,
        // },
        {
          title: 'Site SEO',
          href: `/site`,
          active: true,
        },
      ],
    },
  ];

  return (
    <div className="flex w-full h-full space-y-4">
      {/* <SubNav
        className="flex-none"
        rootPath={`/dashboard/settings`}
        title="Settings"
        groups={subNavGroups}
      /> */}

      <div className="grow w-full h-full overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
