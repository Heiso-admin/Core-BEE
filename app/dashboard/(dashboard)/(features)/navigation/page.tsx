import { redirect } from "next/navigation";
import { getNavigations } from "./_server/navigations.service";

export default async function Page() {
  const navigations = await getNavigations();
  if (navigations.length) {
    redirect(`./navigation/${navigations[0].id}`);
  }

  return null;
}
