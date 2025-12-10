"use client";

import { useEffect, useState } from "react";
import { decodeJWTPayload, JWTPayload } from "@/lib/jwt";

export function useJWTPayload() {
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayload() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

        if (token) {
          const decoded = await decodeJWTPayload(token);
          setPayload(decoded);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du payload JWT:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPayload();
  }, []);

  return { payload, loading };
}
