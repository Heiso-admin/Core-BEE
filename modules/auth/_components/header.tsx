export default function Header({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center space-y-4 font-lato">
      <span>
        <h1 className="text-3xl font-bold text-center">{title}</h1>
        <p className="mt-2 text-center text-sm text-neutral">{description}</p>
      </span>
    </div>
  );
}
