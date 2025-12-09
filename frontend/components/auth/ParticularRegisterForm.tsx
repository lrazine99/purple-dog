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

export function ParticularRegisterForm() {
  const form = useForm<ParticularRegisterFormType>({
    resolver: zodResolver(particularRegisterSchema),
    defaultValues: {
      role: "particular",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rgpd_accepted: false,
      newsletter: false,
    },
  });

  const onSubmit = (data: ParticularRegisterFormType) => {
    console.log("Inscription acheteur:", data);
    // TODO: Appel API
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

        <Button type="submit" className="w-full h-12">
          Créer mon compte
        </Button>
      </form>
    </Form>
  );
}
