import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type ButtonHidePasswordProps = {
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
};

export function ButtonHidePassword({
  showPassword,
  setShowPassword,
}: ButtonHidePasswordProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
      onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="sr-only">
        {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      </span>
    </Button>
  );
}
