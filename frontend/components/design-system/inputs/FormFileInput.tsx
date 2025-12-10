"use client";

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
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";

interface FormFileInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  helper?: string;
  accept?: string;
  maxSize?: number;
}

export function FormFileInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  labelClassName,
  containerClassName,
  helper,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5,
}: FormFileInputProps<TFieldValues>) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Le fichier ne doit pas dépasser ${maxSize}MB`);
      return;
    }

    setFileName(file.name);
    onChange(file);
  };

  const handleRemoveFile = (onChange: (value: File | null) => void) => {
    setFileName(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={(e) => handleFileChange(e, field.onChange)}
                className="hidden"
                id={`file-input-${name}`}
              />

              {!fileName ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choisir un fichier
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemoveFile(field.onChange)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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
