"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === RadioGroupItem) {
            return React.cloneElement(child as React.ReactElement<any>, {
              checked: child.props.value === value,
              onCheckedChange: () => onValueChange?.(child.props.value),
            });
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  checked?: boolean;
  onCheckedChange?: () => void;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onCheckedChange, id, ...props }, ref) => {
    const inputId = id || `radio-${value}`;
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          id={inputId}
          value={value}
          checked={checked}
          onChange={onCheckedChange}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border-2 border-primary text-primary ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
            checked && "border-primary bg-primary",
            className
          )}
        >
          {checked && (
            <Circle className="h-2.5 w-2.5 fill-current text-primary-foreground" />
          )}
        </label>
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

