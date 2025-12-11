"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/design-system/inputs/FormInput";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { particularRegisterSchema } from "@/lib/validation/auth.schema";
import { ParticularRegisterForm as ParticularRegisterFormType } from "@/lib/type/auth.type";
import { useRegisterParticular } from "@/hooks/useRegister";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";

export function ParticularRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const registerMutation = useRegisterParticular();

  const form = useForm<ParticularRegisterFormType>({
    resolver: zodResolver(particularRegisterSchema),
    mode: "onBlur",
    defaultValues: {
      role: "particular",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      address_line: "",
      city: "",
      postal_code: "",
      country: "",
      rgpd_accepted: false,
      newsletter: false,
    },
  });

  const onSubmit = (data: ParticularRegisterFormType) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast({
          variant: "success",
          message: "Inscription réussie",
          description:
            "Votre compte a été créé avec succès. Vous recevrez un email de vérification.",
        });
        router.push("/connexion");
      },
      onError: (error: Error) => {
        toast({
          variant: "error",
          message: "Erreur lors de l'inscription",
          description:
            error.message || "Une erreur est survenue lors de l'inscription.",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="first_name"
            label="Prénom"
            placeholder="Jean"
          />
          <FormInput
            control={form.control}
            name="last_name"
            label="Nom"
            placeholder="Dupont"
          />
        </div>

        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <FormInput
            control={form.control}
            name="address_line"
            label="Adresse"
            placeholder="123 rue de la Paix"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              control={form.control}
              name="postal_code"
              label="Code postal"
              placeholder="75001"
            />
            <FormInput
              control={form.control}
              name="city"
              label="Ville"
              placeholder="Paris"
            />
            <FormInput
              control={form.control}
              name="country"
              label="Pays"
              placeholder="France"
            />
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="rgpd_accepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    J&apos;accepte la politique de confidentialité *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newsletter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Je souhaite recevoir la newsletter</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </form>
    </Form>
  );
}
