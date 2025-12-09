import { z } from "zod";

const baseRegisterFields = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100),
  last_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  email: z.string().email("Email invalide").max(150),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(255),
  confirmPassword: z.string(),
  rgpd_accepted: z.boolean(),
  newsletter: z.boolean(),
});

export const particularRegisterSchema = baseRegisterFields
  .extend({
    role: z.literal("particular"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.rgpd_accepted === true, {
    message: "Vous devez accepter la politique de confidentialité",
    path: ["rgpd_accepted"],
  });

export const professionalRegisterSchema = baseRegisterFields
  .extend({
    role: z.literal("professional"),
    company_name: z
      .string()
      .min(2, "Le nom de l'entreprise est requis")
      .max(150),
    siret: z
      .string()
      .min(14, "Le SIRET doit contenir 14 chiffres")
      .max(14)
      .regex(/^\d{14}$/, "Le SIRET doit contenir uniquement des chiffres"),
    address_line: z.string().min(5, "L'adresse est requise").max(255),
    city: z.string().min(2, "La ville est requise").max(100),
    postal_code: z.string().min(5, "Le code postal est requis").max(20),
    country: z.string().min(2, "Le pays est requis").max(100),
    website_company: z
      .url("URL invalide")
      .max(255)
      .optional()
      .or(z.literal("")),
    speciality: z.string().max(255).optional(),
    cgv_accepted: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.rgpd_accepted === true, {
    message: "Vous devez accepter la politique de confidentialité",
    path: ["rgpd_accepted"],
  })
  .refine((data) => data.cgv_accepted === true, {
    message: "Vous devez accepter les conditions générales de vente",
    path: ["cgv_accepted"],
  });
