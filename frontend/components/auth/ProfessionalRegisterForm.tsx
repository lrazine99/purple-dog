"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { professionalRegisterSchema } from "@/lib/validation/auth.schema";
import { ProfessionalRegisterForm as ProfessionalRegisterFormType } from "@/lib/type/auth.type";
import { useSiretLookup } from "@/hooks/useSiretLookup";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ProfessionalRegisterForm() {
  const form = useForm<ProfessionalRegisterFormType>({
    resolver: zodResolver(professionalRegisterSchema),
    mode: "onBlur",
    defaultValues: {
      role: "professional",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      company_name: "",
      siret: "",
      address_line: "",
      city: "",
      postal_code: "",
      country: "",
      website_company: "",
      speciality: "",
      rgpd_accepted: false,
      cgv_accepted: false,
      newsletter: false,
    },
  });

  const siret = useWatch({
    control: form.control,
    name: "siret",
  });

  const [siretError, setSiretError] = useState<string>("");

  const {
    data: siretData,
    isLoading,
    isError,
    error,
  } = useSiretLookup(siret || "");

  useEffect(() => {
    const shouldShowError = isError && siret && siret.length === 14;

    if (shouldShowError) {
      setSiretError("Erreur lors de la recherche");
    } else {
      setSiretError("");
    }
  }, [isError, error, siret]);

  useEffect(() => {
    if (siretData) {
      form.setValue("company_name", siretData.company_name);
      form.setValue("address_line", siretData.address_line);
      form.setValue("city", siretData.city);
      form.setValue("postal_code", siretData.postal_code);
      form.setValue("country", "France");

      setSiretError("");
    } else {
      form.setValue("company_name", "");
      form.setValue("address_line", "");
      form.setValue("city", "");
      form.setValue("postal_code", "");
      form.setValue("country", "");
    }
  }, [siretData, form]);

  const onSubmit = (data: ProfessionalRegisterFormType) => {
    console.log("Inscription vendeur:", data);
    // TODO: Appel API d'inscription
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Informations personnelles</h3>

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
            label="Email professionnel"
            type="email"
            placeholder="jean.dupont@entreprise.com"
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
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium">
            Informations de l&apos;entreprise
          </h3>

          <div className="relative">
            <FormInput
              control={form.control}
              name="siret"
              label="SIRET"
              placeholder="12345678901234"
              helper="Entrez votre numéro SIRET pour récupérer automatiquement les informations de votre entreprise"
            />
            {isLoading && (
              <div className="absolute right-3 top-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {siretError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm text-destructive font-medium">
                {siretError}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Veuillez vérifier le numéro SIRET saisi.
              </p>
            </div>
          )}

          {!siretError &&
            !isLoading &&
            siret &&
            siret.length === 14 &&
            siretData && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600 font-medium">
                  Entreprise trouvée : {siretData.company_name}
                </p>
              </div>
            )}
        </div>

        {siretData && (
          <div className="space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-medium">
              Détails de l&apos;entreprise
            </h3>

            <FormInput
              control={form.control}
              name="company_name"
              label="Nom de l'entreprise"
              placeholder="Ma Société"
            />

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

            <FormInput
              control={form.control}
              name="website_company"
              label="Site web (optionnel)"
              type="url"
              placeholder="https://www.monsite.com"
            />

            <FormInput
              control={form.control}
              name="speciality"
              label="Spécialité (optionnel)"
              placeholder="Ex: Brocanteur, Antiquaire..."
            />
          </div>
        )}

        {siretData && (
          <>
            <div className="space-y-4 border-t pt-4">
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
                name="cgv_accepted"
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
                        J&apos;accepte les conditions générales de vente *
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
              Créer mon compte professionnel
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
