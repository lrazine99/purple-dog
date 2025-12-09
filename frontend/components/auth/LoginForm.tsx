"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/design-system/inputs/FormInput";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/helper/routes";
import { LoginForm as LoginFormType } from "@/lib/type/auth.type";
import { loginSchema } from "@/lib/validation/auth.schema";
import { useLogin } from "@/hooks/useLogin";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormType) {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);

        toast({
          variant: "success",
          message: "Connexion réussie !",
          description: "Vous êtes maintenant connecté",
        });

        router.push(ROUTES.HOME);
      },
      onError: (error) => {
        toast({
          variant: "error",
          message: "Erreur de connexion",
          description: error.message || "Email ou mot de passe incorrect",
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormInput
          control={form.control}
          name="email"
          label="Adresse email"
          type="email"
          placeholder="jean.dupont@example.com"
          autoComplete="email"
        />

        <FormInput
          control={form.control}
          type="password"
          name="password"
          label="Mot de passe"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          className="w-full h-12"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Pas encore de compte ? </span>
          <Link
            href={ROUTES.INSCRIPTION}
            className="underline hover:text-primary"
          >
            Créer un compte
          </Link>
        </div>
      </form>
    </Form>
  );
}
