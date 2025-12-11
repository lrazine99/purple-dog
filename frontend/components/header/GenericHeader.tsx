"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/helper/routes";
import { useLogout } from "@/hooks/useAuth";
import { Menu, Search, User, X, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ProNavbar } from "./ProNavbar";
import { SellerNavbar } from "./SellerNavbar";
import { useAuth } from "@/hooks/useAuth";

function getUserRoleFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const role = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_role="))
    ?.split("=")[1];
  return role ? decodeURIComponent(role) : null;
}

export const GenericHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = useLogout();
  const { data: userData } = useAuth();
  const router = useRouter();
  const [notif, setNotif] = useState<{ newOffers: number; unreadMessages: number }>({ newOffers: 0, unreadMessages: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [confirmHref, setConfirmHref] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    function checkAuth() {
      // Le cookie access_token est httpOnly, donc inaccessible depuis JavaScript
      // On vérifie uniquement user_role qui est accessible côté client
      const userRole = getUserRoleFromCookie();
      setIsAuthenticated(!!userRole);
      setRole(userRole);
    }

    checkAuth();

    // Vérifier périodiquement les cookies
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: any;
    async function fetchCounters() {
      if (!userData?.id) return;
      try {
        if (role === "professional") {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?sellerId=${userData.id}`);
          if (res.ok) {
            const data = await res.json();
            setNotif({ newOffers: data.newOffers ?? 0, unreadMessages: data.unreadMessages ?? 0 });
          }
        } else {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/user/${userData.id}`);
          if (res.ok) {
            const msgs = await res.json();
            const unread = Array.isArray(msgs) ? msgs.filter((m: any) => !m.is_read).length : 0;
            setNotif({ newOffers: 0, unreadMessages: unread });
          }
        }
      } catch {}
    }
    fetchCounters();
    timer = setInterval(fetchCounters, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [role, userData?.id]);

  useEffect(() => {
    async function fetchList() {
      if (!notifOpen || !userData?.id) return;
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      try {
        if (role === "professional") {
          const [offersRes, messagesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/seller/${userData.id}`, { headers }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/user/${userData.id}`, { headers }),
          ]);
          const offers = offersRes.ok ? await offersRes.json() : [];
          const messages = messagesRes.ok ? await messagesRes.json() : [];
          const oItems = Array.isArray(offers) ? offers.map((o: any) => ({ type: "offer", id: o.id, item_id: o.item_id, item_name: o.item?.name, amount: o.amount, status: o.status, text: `Offre ${o.amount}€ sur \"${o.item?.name || `Objet ${o.item_id}`}\"` , created_at: o.created_at, href: `/paiement/offre/${o.id}` })) : [];
          const mItems = Array.isArray(messages) ? messages.map((m: any) => {
            const content = typeof m.content === "string" ? m.content : "";
            let href: string | undefined;
            const marker = "/paiement/offre/";
            const idx = content.indexOf(marker);
            if (idx >= 0) {
              const rest = content.slice(idx + marker.length);
              const idMatch = rest.match(/^\d+/);
              if (idMatch) href = `/paiement/offre/${idMatch[0]}`;
            }
            const displayText = href || content.includes("Lien de paiement Stripe")
              ? "Votre offre a été acceptée. Confirmez et payez."
              : content;
            return { type: "message", text: content, displayText, created_at: m.created_at, href };
          }) : [];
          const combined = [...oItems, ...mItems]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
          setNotifItems(combined);
        } else {
          const [offersRes, messagesRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/buyer/${userData.id}`, { headers }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/user/${userData.id}`, { headers }),
          ]);
          const offers = offersRes.ok ? await offersRes.json() : [];
          const messages = messagesRes.ok ? await messagesRes.json() : [];
          const acceptedByItem: Record<number, number> = {};
          (Array.isArray(offers) ? offers : []).forEach((o: any) => {
            if (o.status === "accepted") acceptedByItem[o.item_id] = o.id;
          });
          const oItems = Array.isArray(offers) ? offers.map((o: any) => ({ type: "offer", id: o.id, item_id: o.item_id, item_name: o.item?.name, amount: o.amount, status: o.status, text: `Offre ${o.amount}€ sur \"${o.item?.name || `Objet ${o.item_id}`}\"` , created_at: o.created_at, href: o.status === "accepted" ? `/paiement/offre/${o.id}` : undefined })) : [];
          const mItems = Array.isArray(messages) ? messages.map((m: any) => {
            const content = typeof m.content === "string" ? m.content : "";
            let href: string | undefined;
            const marker = "/paiement/offre/";
            const idx = content.indexOf(marker);
            if (idx >= 0) {
              const rest = content.slice(idx + marker.length);
              const idMatch = rest.match(/^\d+/);
              if (idMatch) href = `/paiement/offre/${idMatch[0]}`;
            }
            if (!href && typeof m.item_id === "number" && acceptedByItem[m.item_id]) {
              href = `/paiement/offre/${acceptedByItem[m.item_id]}`;
            }
            const displayText = href || content.includes("Lien de paiement Stripe")
              ? "Votre offre a été acceptée. Confirmez et payez."
              : content;
            return { type: "message", text: content, displayText, created_at: m.created_at, href };
          }) : [];
          const combined = [...oItems, ...mItems]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
          setNotifItems(combined);
        }
      } catch {
        setNotifItems([]);
      }
    }
    fetchList();
  }, [notifOpen, role, userData?.id]);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <Image
                src="/purple-dog-logo.png"
                alt="Purple Dog Logo"
                width={120}
                height={120}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && (
                <>
                  {role === "particular" && <ProNavbar />}
                  {role === "professional" && (
                    <>
                      <ProNavbar />
                      <SellerNavbar />
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 h-9 bg-secondary border-transparent focus:border-accent"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button asChild variant="default">
                    <Link
                      href={ROUTES.MON_COMPTE}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Mon compte
                    </Link>
                  </Button>
                  <div className="relative">
                    <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                    </Button>
                    {(notif.newOffers + notif.unreadMessages) > 0 && (
                      <span className="absolute -top-1 -right-1">
                        <Badge variant="destructive">{notif.newOffers + notif.unreadMessages}</Badge>
                      </span>
                    )}
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto bg-background border rounded shadow-lg p-2 z-50">
                        <div className="text-sm font-medium px-2 py-1">Notifications</div>
                        <div className="divide-y">
                          {notifItems.length === 0 ? (
                            <div className="text-sm text-muted-foreground px-2 py-3">Aucune notification</div>
                          ) : (
                            notifItems.map((n, idx) => (
                              <div key={idx} className="px-2 py-2 flex items-center gap-2">
                                <Badge variant={n.type === "offer" ? "secondary" : "outline"} className="shrink-0">{n.type === "offer" ? "Offre" : "Message"}</Badge>
                                {n.href ? (
                                  <button
                                    type="button"
                                    onClick={() => { setConfirmHref(n.href); setConfirmOpen(true); }}
                                    className="text-sm flex-1 text-left whitespace-pre-wrap break-words hover:text-accent transition-colors"
                                  >
                                    {n.displayText || n.text}
                                  </button>
                                ) : (
                                  <div className="text-sm flex-1 whitespace-pre-wrap break-words">{n.displayText || n.text}</div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer le paiement</DialogTitle>
                        <DialogDescription>
                          Souhaitez-vous payer le produit pour lequel votre offre a été acceptée ?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Plus tard</Button>
                        <Button onClick={() => { if (confirmHref) { setConfirmOpen(false); setNotifOpen(false); router.push(confirmHref); } }}>Continuer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href={ROUTES.CONNEXION}>Se connecter</Link>
                  </Button>
                  <Button asChild>
                    <Link href={ROUTES.INSCRIPTION}>S&apos;inscrire</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Menu hamburger mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4">
              {isAuthenticated && (
                <>
                  {role === "professional" && (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={ROUTES.PRODUITS}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Produits
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Favoris
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Enchères
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Achats
                      </Link>
                    </div>
                  )}
                  {role === "particular" && (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={ROUTES.PRODUITS}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Produits
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Favoris
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Enchères
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Achats
                      </Link>
                      <Link
                        href={ROUTES.MY_SHOP}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Ma Boutique
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Barre de recherche mobile */}
              <div className="flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9 h-9 bg-secondary border-transparent focus:border-accent"
                  />
                </div>
              </div>

              {/* Boutons d'authentification mobile */}
              <div className="flex flex-col gap-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="default" className="w-full">
                      <Link
                        href={ROUTES.MON_COMPTE}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Mon compte
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link
                        href={ROUTES.CONNEXION}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Se connecter
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link
                        href={ROUTES.INSCRIPTION}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        S&apos;inscrire
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default GenericHeader;
