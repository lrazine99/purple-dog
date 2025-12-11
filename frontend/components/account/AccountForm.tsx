"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { type UpdateUserDto, type User } from "@/lib/api/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema pour les utilisateurs particuliers
const particularSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  address_line: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  age: z
    .number()
    .min(18, "L'âge doit être d'au moins 18 ans")
    .optional()
    .or(z.literal("")),
  profile_picture: z.string().optional(),
  newsletter: z.boolean().optional(),
});

// Schema pour les utilisateurs professionnels
const professionalSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  address_line: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  company_name: z.string().min(1, "Le nom de l'entreprise est requis"),
  siret: z.string().optional(),
  website_company: z.string().url("URL invalide").optional().or(z.literal("")),
  speciality: z.string().optional(),
  items_preference: z.string().optional(),
  profile_picture: z.string().optional(),
  social_links: z.string().url("URL invalide").optional().or(z.literal("")),
  newsletter: z.boolean().optional(),
});

interface AccountFormProps {
  user: User;
  role: string;
  onUpdate: (data: UpdateUserDto, file?: File) => void;
  isPending: boolean;
}

export function AccountForm({
  user,
  role,
  onUpdate,
  isPending,
}: AccountFormProps) {
  const { toast } = useToast();
  const [officialDocument, setOfficialDocument] = useState<File | undefined>();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const schema =
    role === "professional" ? professionalSchema : particularSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      address_line: user.address_line || "",
      city: user.city || "",
      postal_code: user.postal_code || "",
      country: user.country || "",
      age: user.age || undefined,
      profile_picture: user.profile_picture || "",
      newsletter: user.newsletter || false,
      ...(role === "professional" && {
        company_name: user.company_name || "",
        siret: user.siret || "",
        website_company: user.website_company || "",
        speciality: user.speciality || "",
        items_preference: user.items_preference || "",
        social_links: user.social_links || "",
      }),
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    const baseData: UpdateUserDto = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      address_line: data.address_line,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country,
      profile_picture: data.profile_picture,
      newsletter: data.newsletter,
    };

    if (role === "particular") {
      const particularData = data as z.infer<typeof particularSchema>;
      baseData.age =
        particularData.age === ""
          ? undefined
          : (particularData.age as number | undefined);
    } else if (role === "professional") {
      const professionalData = data as z.infer<typeof professionalSchema>;
      baseData.company_name = professionalData.company_name;
      baseData.siret = professionalData.siret;
      baseData.website_company =
        professionalData.website_company === ""
          ? undefined
          : professionalData.website_company;
      baseData.speciality = professionalData.speciality;
      baseData.items_preference = professionalData.items_preference;
      baseData.social_links =
        professionalData.social_links === ""
          ? undefined
          : professionalData.social_links;
    }

    const updateData: UpdateUserDto = baseData;

    onUpdate(updateData, officialDocument);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Informations personnelles
          </h2>

          {/* Photo de profil */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Photo de profil
            </label>
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Only allow images
                  if (!file.type.startsWith("image/")) {
                    toast({
                      variant: "error",
                      message: "Erreur",
                      description: "Veuillez télécharger un fichier image",
                    });
                    return;
                  }

                  setUploadingPhoto(true);

                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      throw new Error(
                        data.message || "Échec du téléchargement"
                      );
                    }

                    // Set the profile picture URL in the form
                    // Le backend retourne une URL relative comme /upload/filename
                    // On utilise la route proxy Next.js pour servir les fichiers
                    let profilePictureUrl = data.url;
                    if (data.url && !data.url.startsWith("http")) {
                      // Utiliser la route proxy Next.js pour servir les fichiers uploadés
                      // La route /api/upload/[...path] correspond à /upload/... du backend
                      profilePictureUrl = `/api${data.url}`;
                    }

                    console.log("Upload response:", data);
                    console.log("Profile picture URL:", profilePictureUrl);

                    form.setValue("profile_picture", profilePictureUrl);
                  } catch (err) {
                    const errorMessage =
                      err instanceof Error
                        ? err.message
                        : "Échec du téléchargement de la photo";
                    toast({
                      variant: "error",
                      message: "Erreur",
                      description: errorMessage,
                    });
                  } finally {
                    setUploadingPhoto(false);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploadingPhoto}
              />
              <div
                className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                  form.watch("profile_picture")
                    ? "border-primary/50"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : form.watch("profile_picture") ? (
                  <img
                    src={form.watch("profile_picture") || ""}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error(
                        "Image load error:",
                        form.watch("profile_picture")
                      );
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      Télécharger
                    </span>
                  </div>
                )}
              </div>
              {form.watch("profile_picture") && (
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("profile_picture", "");
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Cliquez sur l&apos;image pour télécharger une nouvelle photo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === "particular" && (
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Âge</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : parseInt(value, 10)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Adresse</h2>

          <FormField
            control={form.control}
            name="address_line"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code postal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informations professionnelles (uniquement pour les professionnels) */}
        {role === "professional" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Informations professionnelles
            </h2>

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;entreprise *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIRET</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web de l&apos;entreprise</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        {...field}
                        value={field.value === "" ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="speciality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialité</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="items_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Préférences d&apos;articles</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Document officiel
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setOfficialDocument(file);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-sm text-muted-foreground">
                {user.official_document_url ? (
                  <span>
                    Document actuel :{" "}
                    <a
                      href={user.official_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir le document
                    </a>
                  </span>
                ) : (
                  "Aucun document téléchargé"
                )}
              </p>
            </div>
          </div>
        )}

        {/* Préférences */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Préférences
          </h2>

          {role === "professional" && (
            <FormField
              control={form.control}
              name="social_links"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liens sociaux</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      {...field}
                      value={field.value === "" ? "" : field.value}
                      placeholder="https://..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                  <FormLabel>S&apos;abonner à la newsletter</FormLabel>
                  <FormDescription>
                    Recevez les dernières actualités et offres spéciales
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
