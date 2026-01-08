import { cn } from "@heiso/core/lib/utils";
import { Label } from "./label";
import { RadioGroupItem } from "./radio-group";

function RadioTagGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupItem>) {
  return <RadioGroupItem className={cn(" peer", className)} {...props} />;
}

function RadioTagLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        "cursor-pointer select-none inline-flex items-center justify-center px-3 py-1 rounded-md text-xs transition-colors whitespace-nowrap border shadow-xs hover:bg-background dark:hover:bg-input/50 text-text-Neutral/70 border-input/50",
        "peer-data-[state=checked]:bg-background dark:peer-data-[state=checked]:bg-input/50  peer-data-[state=checked]:text-text-Neutral peer-data-[state=checked]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { RadioTagGroupItem, RadioTagLabel };
