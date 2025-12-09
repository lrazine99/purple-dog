"use client";

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

export function LoginForm() {
  const { toast } = useToast();

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormType) {
    console.log("Connexion:", data);

    toast({
      variant: "success",
      message: "Connexion réussie !",
      description: "Vous êtes maintenant connecté",
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

        <Button type="submit" className="w-full h-12">
          Se connecter
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Pas encore de compte ? </span>
          <Link href="/inscription" className="underline hover:text-primary">
            Créer un compte
          </Link>
        </div>
      </form>
    </Form>
  );
}
