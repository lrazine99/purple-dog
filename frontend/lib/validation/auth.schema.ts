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
  email: z.email("Email invalide").max(150),
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
    address_line: z.string().min(5, "L'adresse est requise").max(255),
    city: z.string().min(2, "La ville est requise").max(100),
    postal_code: z.string().min(5, "Le code postal est requis").max(20),
    country: z.string().min(2, "Le pays est requis").max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.rgpd_accepted === true, {
    message: "Vous devez accepter la politique de confidentialité",
    path: ["rgpd_accepted"],
  });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const fileSchema = z
  .instanceof(File, { message: "Le document officiel est requis" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Le fichier ne doit pas dépasser 5MB",
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: "Format de fichier invalide. Formats acceptés: PDF, JPG, PNG",
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
    speciality: z.string().max(255).min(1),
    items_preference: z
      .string()
      .min(1, "La préférence d'articles est requise")
      .max(255),
    official_document: fileSchema,
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

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const userResponseSchema = z.object({
  id: z.number(),
  role: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.email(),
  address_line: z.string().nullish(),
  city: z.string().nullish(),
  postal_code: z.string().nullish(),
  country: z.string().nullish(),
  website_company: z.string().nullish(),
  items_preference: z.string().nullish(),
  speciality: z.string().nullish(),
  profile_picture: z.string().nullish(),
  age: z.number().nullish(),
  social_links: z.string().nullish(),
  newsletter: z.boolean(),
  rgpd_accepted: z.boolean(),
  company_name: z.string().nullish(),
  siret: z.string().nullish(),
  official_document_url: z.string().nullish(),
  cgv_accepted: z.boolean(),
  is_verified: z.boolean(),
  subscription: z
    .object({
      id: z.number(),
      plan_type: z.enum(["free_trial", "paid"]),
      status: z.enum(["active", "expired", "cancelled", "pending_payment"]),
      price: z.number(),
      trial_start_date: z.coerce.date().nullish(),
      trial_end_date: z.coerce.date().nullish(),
      next_billing_date: z.coerce.date().nullish(),
      created_at: z.coerce.date(),
      updated_at: z.coerce.date(),
    })
    .nullish(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
