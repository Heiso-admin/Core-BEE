import { icons } from "lucide-react";

export function LucideIcon({
  name,
  color,
  size,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const LucideIcon = icons[name as keyof typeof icons];
  return <LucideIcon color={color} size={size} className={className} />;
}
