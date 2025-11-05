import { Header, SignUp } from "../_components";
import { getTranslations } from "next-intl/server";

export default async function Page({
  searchParams,
}: {
  searchParams?: { email?: string };
}) {
  const t = await getTranslations('auth.signup');
  const email = searchParams?.email ?? "";

  return (
    <div className="w-full max-w-md space-y-10">
      <Header
        title={t('title')}
        description={
         <div className="text-center mt-5">
          <p className="text-sm text-neutral">{t('description', { email })}</p>
         </div>
        }
      />
      <SignUp email={email} />
    </div>
  );
}
