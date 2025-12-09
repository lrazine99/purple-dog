/**
 * Application Routes
 * Centralized route definitions for type safety and consistency
 */
export const ROUTES = {
  // Public routes
  HOME: "/",
  CONNEXION: "/connexion",
  INSCRIPTION: "/inscription",

  // Legal pages
  MENTIONS_LEGALES: "/mentions-legales",
  QUI_SOMMES_NOUS: "/qui-sommes-nous",
  CONFIDENTIALITE: "/confidentialite",
  CGU: "/cgu",
  CONTACT: "/contact",

  // Product pages
  PRODUITS: "/produits",

  // User pages
  MON_COMPTE: "/mon-compte",
} as const;

/**
 * Helper function to get route with optional parameters
 */
export function getRoute(route: keyof typeof ROUTES): string {
  return ROUTES[route];
}

/**
 * Type-safe route paths
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
