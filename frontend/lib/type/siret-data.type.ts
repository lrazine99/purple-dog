import z from "zod";
import { siretDataSchema } from "./siret.type";

export type SiretData = z.infer<typeof siretDataSchema>;
