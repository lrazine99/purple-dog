import z from "zod";
import {
  loginSchema,
  particularRegisterSchema,
  professionalRegisterSchema,
  userResponseSchema,
} from "../validation/auth.schema";

export type ParticularRegisterForm = z.infer<typeof particularRegisterSchema>;
export type ProfessionalRegisterForm = z.infer<
  typeof professionalRegisterSchema
>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
