import { jwtVerify } from "jose";
import { z } from "zod";

export const JWTPayloadSchema = z.object({
  sub: z.number(),
  email: z.email(),
  role: z.enum(["particular", "professional", "admin"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export async function decodeJWTPayload(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secretValue = process.env.JWT_ACCESS_SECRET;

    if (!secretValue) {
      console.error(
        "JWT_ACCESS_SECRET n'est pas défini dans les variables d'environnement"
      );
      return null;
    }

    const secret = new TextEncoder().encode(secretValue);

    const { payload } = await jwtVerify(token, secret);

    const validatedPayload = JWTPayloadSchema.safeParse(payload);

    if (!validatedPayload.success) {
      console.error("Payload JWT invalide:", validatedPayload.error.flatten());
      return null;
    }

    return validatedPayload.data;
  } catch (error) {
    console.error("Erreur lors du décodage du token JWT:", error);
    return null;
  }
}
