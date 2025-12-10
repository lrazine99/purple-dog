/**
 * Wrapper autour de fetch qui gère automatiquement le refresh du token
 * quand une erreur 401 est rencontrée
 */
export async function fetchWithRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let response = await fetch(url, options);

  // Si on reçoit un 401, essayer de rafraîchir le token
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (refreshResponse.ok) {
        // Réessayer la requête originale avec les nouveaux tokens
        // Les cookies sont automatiquement mis à jour par le route handler
        response = await fetch(url, options);
      } else {
        // Si le refresh échoue, rediriger vers la page de connexion
        if (typeof window !== "undefined") {
          window.location.href = "/connexion";
        }
      }
    } catch (error) {
      console.error("Erreur lors du refresh du token:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/connexion";
      }
    }
  }

  return response;
}

