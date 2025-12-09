"use client";

import { cn } from "@/lib/utils";

type SwitchButtonProps<T extends string> = {
  value: T;
  options: readonly {
    readonly value: T;
    readonly label: string;
  }[];
  onChange: (value: T) => void;
  className?: string;
};

export function SwitchButton<T extends string>({
  value,
  options,
  onChange,
  className,
}: SwitchButtonProps<T>) {
  return (
    <div
      className={cn(
        "w-full flex rounded-lg bg-gray-300 border border-gray p-2",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-md px-6 py-2 text-sm text-center font-medium transition-colors h-12 flex items-center justify-center",
            value === option.value
              ? "bg-black text-white"
              : "bg-transparent text-black hover:bg-gray-200"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
