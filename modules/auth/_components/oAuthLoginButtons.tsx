import { Button } from "@heiso/core/components/ui/button";
import { Icon, type IconifyIcon } from "@iconify/react";
import Image, { type StaticImageData } from "next/image";

interface OAuthLoginButtonsProps {
  href?: string;
  src?: StaticImageData;
  icon?: string | IconifyIcon;
  alt: string;
}

const OAuthLoginButtons = ({
  href,
  src,
  icon,
  alt,
  ...props
}: React.ComponentProps<"button"> & OAuthLoginButtonsProps) => {
  return (
    <Button asChild variant="outline" className="w-full rounded-4xl" {...props}>
      <a href={href} className="flex items-center gap-2">
        {src && (
          <Image
            src={src}
            alt={alt}
            width={20}
            height={20}
            loading="lazy"
            decoding="async"
          />
        )}
        {icon && <Icon icon={icon} className="size-5" />}
        <span>{`Sign in with ${alt}`}</span>
      </a>
    </Button>
  );
};

export default OAuthLoginButtons;
