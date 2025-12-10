import { z } from "zod";
import { categorySchema } from "../validation/category.schema";

export type Category = z.infer<typeof categorySchema>;

export type CategoriesResponse = Category[];
