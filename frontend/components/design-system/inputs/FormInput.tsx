import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonHidePassword } from "../buttons/ButtonHidePassword";

interface FormInputProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  helper?: string;
  placeholder?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  labelClassName,
  containerClassName,
  helper,
  placeholder,
  type = "text",
  ...inputProps
}: FormInputProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("w-full", containerClassName)}>
          <FormLabel
            className={cn(
              "text-desktop-text-14 text-data-[error=true]:text-black",
              labelClassName
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={inputType}
                placeholder={placeholder}
                className={"text-desktop-text-16 h-12"}
                aria-invalid={!!fieldState.error}
                {...field}
                {...inputProps}
              />
              {isPassword && (
                <ButtonHidePassword
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}
            </div>
          </FormControl>
          {helper && <FormDescription>{helper}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
