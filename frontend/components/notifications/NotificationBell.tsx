"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NotificationItem {
  type: "offer" | "message";
  id?: number;
  item_id?: number;
  item_name?: string;
  amount?: number;
  status?: string;
  text: string;
  displayText?: string;
  created_at: string;
  href?: string;
}

interface Message {
  id: number;
  content: string;
  is_read: boolean;
  item_id?: number;
  created_at: string;
}

interface Offer {
  id: number;
  item_id: number;
  item?: { name: string };
  amount: number;
  status: string;
  created_at: string;
}

interface NotificationBellProps {
  userId: number;
  role: string;
  isLoading: boolean;
}

export function NotificationBell({
  userId,
  role,
  isLoading,
}: NotificationBellProps) {
  const router = useRouter();
  const [notif, setNotif] = useState<{
    newOffers: number;
    unreadMessages: number;
  }>({ newOffers: 0, unreadMessages: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [confirmHref, setConfirmHref] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch notification counters
  useEffect(() => {
    if (isLoading || !userId) return;
    let timer: NodeJS.Timeout | null = null;

    async function fetchCounters() {
      if (!userId) return;
      try {
        if (role === "professional") {
          const res = await fetch(`/api/notifications?sellerId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            setNotif({
              newOffers: data.newOffers ?? 0,
              unreadMessages: data.unreadMessages ?? 0,
            });
          }
        } else {
          const res = await fetch(`/api/messages/user/${userId}`);
          if (res.ok) {
            const msgs = (await res.json()) as Message[];
            const unread = Array.isArray(msgs)
              ? msgs.filter((m: Message) => !m.is_read).length
              : 0;
            setNotif({ newOffers: 0, unreadMessages: unread });
          }
        }
      } catch {}
    }

    fetchCounters();
    timer = setInterval(fetchCounters, 30000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [role, userId, isLoading]);

  // Fetch notification items when dropdown opens
  useEffect(() => {
    if (isLoading || !notifOpen || !userId) return;

    async function fetchList() {
      if (!userId) return;
      try {
        if (role === "professional") {
          const [offersRes, messagesRes] = await Promise.all([
            fetch(`/api/offers/seller/${userId}`, {
              credentials: "include",
            }),
            fetch(`/api/messages/user/${userId}`, {
              credentials: "include",
            }),
          ]);
          const offers = offersRes.ok
            ? ((await offersRes.json()) as Offer[])
            : [];
          const messages = messagesRes.ok
            ? ((await messagesRes.json()) as Message[])
            : [];
          const oItems: NotificationItem[] = Array.isArray(offers)
            ? offers.map((o: Offer) => ({
                type: "offer" as const,
                id: o.id,
                item_id: o.item_id,
                item_name: o.item?.name,
                amount: o.amount,
                status: o.status,
                text: `Offre ${o.amount}€ sur \"${
                  o.item?.name || `Objet ${o.item_id}`
                }\"`,
                created_at: o.created_at,
                href: `/paiement/offre/${o.id}`,
              }))
            : [];
          const mItems: NotificationItem[] = Array.isArray(messages)
            ? messages.map((m: Message) => {
                const content = typeof m.content === "string" ? m.content : "";
                let href: string | undefined;
                const marker = "/paiement/offre/";
                const idx = content.indexOf(marker);
                if (idx >= 0) {
                  const rest = content.slice(idx + marker.length);
                  const idMatch = rest.match(/^\d+/);
                  if (idMatch) href = `/paiement/offre/${idMatch[0]}`;
                }
                const displayText =
                  href || content.includes("Lien de paiement Stripe")
                    ? "Votre offre a été acceptée. Confirmez et payez."
                    : content;
                return {
                  type: "message",
                  text: content,
                  displayText,
                  created_at: m.created_at,
                  href,
                };
              })
            : [];
          const combined = [...oItems, ...mItems]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 10);
          setNotifItems(combined);
        } else {
          const [offersRes, messagesRes] = await Promise.all([
            fetch(`/api/offers/buyer/${userId}`, {
              credentials: "include",
            }),
            fetch(`/api/messages/user/${userId}`, {
              credentials: "include",
            }),
          ]);
          const offers = offersRes.ok
            ? ((await offersRes.json()) as Offer[])
            : [];
          const messages = messagesRes.ok
            ? ((await messagesRes.json()) as Message[])
            : [];
          const acceptedByItem: Record<number, number> = {};
          (Array.isArray(offers) ? offers : []).forEach((o: Offer) => {
            if (o.status === "accepted") acceptedByItem[o.item_id] = o.id;
          });
          const oItems: NotificationItem[] = Array.isArray(offers)
            ? offers.map((o: Offer) => ({
                type: "offer" as const,
                id: o.id,
                item_id: o.item_id,
                item_name: o.item?.name,
                amount: o.amount,
                status: o.status,
                text: `Offre ${o.amount}€ sur \"${
                  o.item?.name || `Objet ${o.item_id}`
                }\"`,
                created_at: o.created_at,
                href:
                  o.status === "accepted"
                    ? `/paiement/offre/${o.id}`
                    : undefined,
              }))
            : [];
          const mItems: NotificationItem[] = Array.isArray(messages)
            ? messages.map((m: Message) => {
                const content = typeof m.content === "string" ? m.content : "";
                let href: string | undefined;
                const marker = "/paiement/offre/";
                const idx = content.indexOf(marker);
                if (idx >= 0) {
                  const rest = content.slice(idx + marker.length);
                  const idMatch = rest.match(/^\d+/);
                  if (idMatch) href = `/paiement/offre/${idMatch[0]}`;
                }
                if (
                  !href &&
                  typeof m.item_id === "number" &&
                  acceptedByItem[m.item_id]
                ) {
                  href = `/paiement/offre/${acceptedByItem[m.item_id]}`;
                }
                const displayText =
                  href || content.includes("Lien de paiement Stripe")
                    ? "Votre offre a été acceptée. Confirmez et payez."
                    : content;
                return {
                  type: "message",
                  text: content,
                  displayText,
                  created_at: m.created_at,
                  href,
                };
              })
            : [];
          const combined = [...oItems, ...mItems]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 10);
          setNotifItems(combined);
        }
      } catch {
        setNotifItems([]);
      }
    }
    fetchList();
  }, [notifOpen, role, userId, isLoading]);

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
        {notif.newOffers + notif.unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1">
            <Badge variant="destructive">
              {notif.newOffers + notif.unreadMessages}
            </Badge>
          </span>
        )}
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto bg-background border rounded shadow-lg p-2 z-50">
            <div className="text-sm font-medium px-2 py-1">Notifications</div>
            <div className="divide-y">
              {notifItems.length === 0 ? (
                <div className="text-sm text-muted-foreground px-2 py-3">
                  Aucune notification
                </div>
              ) : (
                notifItems.map((n, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-2 flex items-center gap-2"
                  >
                    <Badge
                      variant={
                        n.type === "offer" ? "secondary" : "outline"
                      }
                      className="shrink-0"
                    >
                      {n.type === "offer" ? "Offre" : "Message"}
                    </Badge>
                    {n.href ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmHref(n.href || null);
                          setConfirmOpen(true);
                        }}
                        className="text-sm flex-1 text-left whitespace-pre-wrap break-words hover:text-accent transition-colors"
                      >
                        {n.displayText || n.text}
                      </button>
                    ) : (
                      <div className="text-sm flex-1 whitespace-pre-wrap break-words">
                        {n.displayText || n.text}
                      </div>
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
              Souhaitez-vous payer le produit pour lequel votre offre a été
              acceptée ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Plus tard
            </Button>
            <Button
              onClick={() => {
                if (confirmHref) {
                  setConfirmOpen(false);
                  setNotifOpen(false);
                  router.push(confirmHref);
                }
              }}
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

