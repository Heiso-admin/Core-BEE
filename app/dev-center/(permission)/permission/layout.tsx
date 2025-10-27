export default function PermissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full">
      <div className="grow w-full h-full overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
