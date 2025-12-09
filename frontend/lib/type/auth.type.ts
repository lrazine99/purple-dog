import z from "zod";
import {
  particularRegisterSchema,
  professionalRegisterSchema,
} from "../validation/auth.schema";

export type ParticularRegisterForm = z.infer<typeof particularRegisterSchema>;
export type ProfessionalRegisterForm = z.infer<
  typeof professionalRegisterSchema
>;
