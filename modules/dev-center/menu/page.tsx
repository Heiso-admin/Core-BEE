import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MenuEdit } from "./_components/menu-edit";
import { getMenus } from "./_server/menu.service";

export default async function MenuPage() {
  const t = await getTranslations("devCenter.menu");
  const { data: menu, count } = await getMenus({
    recursive: true,
  });
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <MenuEdit items={menu} count={count} />
    </Suspense>
  );
}
