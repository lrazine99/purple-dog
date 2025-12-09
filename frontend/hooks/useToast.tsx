import { toast as sonnerToast } from "sonner";

type ToastVariant = "success" | "warning" | "error";

type ToastOptions = {
  variant: ToastVariant;
  message: string;
  description?: string;
};

export function useToast() {
  const toastStyles = {
    success: {
      background: "var(--color-green-100)",
      border: "1px solid var(--color-green)",
      color: "var(--color-green)",
    },
    warning: {
      background: "var(--color-secondary-100)",
      border: "1px solid var(--color-secondary)",
      color: "var(--color-secondary)",
    },
    error: {
      background: "var(--color-primary-100)",
      border: "1px solid var(--color-primary)",
      color: "var(--color-primary)",
    },
  };

  const toast = ({ variant, message, description }: ToastOptions): void => {
    const toastFn = sonnerToast[variant];

    toastFn(message, {
      description,
      duration: 5000,
      style: toastStyles[variant],
      className: `toast-${variant}`,
    });
  };

  return {
    toast,
  };
}
