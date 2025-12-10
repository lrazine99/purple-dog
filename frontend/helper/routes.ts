export const ROUTES = {
  HOME: "/",
  CONNEXION: "/connexion",
  INSCRIPTION: "/inscription",

  MENTIONS_LEGALES: "/mentions-legales",
  QUI_SOMMES_NOUS: "/qui-sommes-nous",
  CONFIDENTIALITE: "/confidentialite",
  CGU: "/cgu",
  CONTACT: "/contact",

  PRODUITS: "/produits",

  // User pages
  AUTH_VERIFY: "/auth/verify",

  MON_COMPTE: "/mon-compte",
} as const;

export const PROTECTED_ROUTES = [ROUTES.PRODUITS, ROUTES.MON_COMPTE] as const;

export const AUTH_ROUTES = [ROUTES.CONNEXION, ROUTES.INSCRIPTION] as const;

export function getRoute(route: keyof typeof ROUTES): string {
  return ROUTES[route];
}

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
