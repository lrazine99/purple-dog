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

  AUTH_VERIFY: "/auth/verify",

  MON_COMPTE: "/mon-compte",
  FAVORIS: "/favoris",
  MA_BOUTIQUE: "/ma-boutique",
  MES_ENCHERES: "/mes-encheres",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ITEMS: "/admin/items",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_ORDERS: "/admin/orders",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,

  ROUTES.PRODUITS,
] as const;

export const PROFESSIONNEL_ROUTES = [ROUTES.MA_BOUTIQUE] as const;
export const PARTICULAR_ROUTES = [ROUTES.MA_BOUTIQUE] as const;

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_ITEMS,
  ROUTES.ADMIN_CATEGORIES,
  ROUTES.ADMIN_ORDERS,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.MON_COMPTE,
  ROUTES.FAVORIS,
  ROUTES.MES_ENCHERES,
  ROUTES.MA_BOUTIQUE,
  ...ADMIN_ROUTES,
] as const;

export const AUTH_ROUTES = [ROUTES.CONNEXION, ROUTES.INSCRIPTION] as const;

export function getRoute(route: keyof typeof ROUTES): string {
  return ROUTES[route];
}

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
