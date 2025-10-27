import { Suspense } from "react";
import { NavigationMenuEdit } from "../_components/navigation-menu-edit";
import { getMenu } from "../_server/navigation-menus.service";
import { getNavigations } from "../_server/navigations.service";

export default async function NavigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const navList = await getNavigations();
  const { data: menu, count } = await getMenu(id, {
    recursive: true,
  });

  const firstNavId = navList?.[0]?.id;
  const { data: firstNavMenu } = firstNavId
    ? await getMenu(firstNavId, { recursive: true })
    : { data: [] };
  const firstList = firstNavMenu;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NavigationMenuEdit
        navId={id}
        items={menu}
        count={count}
        navList={navList}
        firstList={firstList}
      />
    </Suspense>
  );
}
