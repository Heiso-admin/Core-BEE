"use client";
import { Input } from "@heiso/core/components/ui/input";
import { cn } from "@heiso/core/lib/utils";
import { Search, X } from "lucide-react";
import { forwardRef, useState } from "react";

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  clearAriaLabel?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      clearAriaLabel = "Clear",
      onChange,
      defaultValue,
      value,
      ...props
    },
    ref,
  ) => {
    const isControlled = typeof value !== "undefined";
    const [internalHasValue, setInternalHasValue] = useState<boolean>(() =>
      typeof defaultValue === "string" ? defaultValue.length > 0 : false,
    );
    const hasValue = isControlled
      ? typeof value === "string" && value.length > 0
      : internalHasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const handleClear = () => {
      if (isControlled && typeof onChange === "function") {
        const target = { value: "" } as unknown as HTMLInputElement;
        const event = {
          target,
          currentTarget: target,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      } else if (ref && typeof ref !== "function" && ref?.current) {
        ref.current.value = "";
        setInternalHasValue(false);
        ref.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    return (
      <div className={cn("relative flex items-center w-50", className)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-9 pr-8"
          variant="clean"
          ref={ref}
          placeholder="Search..."
          onChange={handleChange}
          defaultValue={defaultValue}
          value={value}
          {...props}
        />
        {hasValue ? (
          <button
            type="button"
            aria-label={clearAriaLabel}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
