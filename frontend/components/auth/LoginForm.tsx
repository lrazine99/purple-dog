"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/design-system/inputs/FormInput";
import {
  loginSchema,
  type LoginForm as LoginFormType,
} from "@/lib/validation/auth.schema";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/helper/routes";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormType) {
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Échec de la connexion");
      }

      // Store tokens
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);

      toast({
        variant: "success",
        message: "Connexion réussie !",
        description: "Vous êtes maintenant connecté",
      });

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (error: any) {
      toast({
        variant: "error",
        message: "Erreur de connexion",
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
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

        <Button type="submit" disabled={loading} className="w-full h-12">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Pas encore de compte ? </span>
          <Link href={ROUTES.INSCRIPTION} className="underline hover:text-primary">
            Créer un compte
          </Link>
        </div>
      </form>
    </Form>
  );
}
