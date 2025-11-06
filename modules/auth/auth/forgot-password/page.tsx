import ForgotPassword from '@/modules/auth/_components/forgotPassword';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const sp = await searchParams;
  const email = sp?.email ?? '';
  return (
    <div className="flex flex-col justify-center space-y-4 max-w-md items-stretch">
      <ForgotPassword email={email} />
    </div>
  );
}