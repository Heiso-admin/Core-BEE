export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full overflow-y-hidden bg-sub-background">
      {children}
    </div>
  );
}
