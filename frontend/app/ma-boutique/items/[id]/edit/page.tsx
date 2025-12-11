"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GenericHeader from "@/components/header/GenericHeader";
import Footer from "@/components/homepage/footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/helper/routes";

interface Item {
  id: number;
  name: string;
  description: string;
  category_id: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number;
  price_desired: number | string;
  price_min?: number | string;
  sale_mode: "auction" | "fast";
  auction_start_price?: number | null;
  auction_end_date?: string | null;
  status: string;
}

interface ItemForm {
  name: string;
  description: string;
  category_id: string;
  width_cm: string;
  height_cm: string;
  depth_cm: string;
  weight_kg: string;
  price_desired: string;
  price_min: string;
  sale_mode: "fast" | "auction";
  auction_start_price: string;
  auction_end_date: string;
}

const initialForm: ItemForm = {
  name: "",
  description: "",
  category_id: "",
  width_cm: "",
  height_cm: "",
  depth_cm: "",
  weight_kg: "",
  price_desired: "",
  price_min: "",
  sale_mode: "fast",
  auction_start_price: "",
  auction_end_date: "",
};

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState<ItemForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const SALE_MODES = useMemo(() => ([
    { value: "fast", label: "Vente rapide" },
    { value: "auction", label: "Enchères" },
  ]), []);

  useEffect(() => {
    const run = async () => {
      try {
        if (!id) return;
        const res = await fetch(`/api/items/${id}`, { method: "GET" });
        if (!res.ok) return;
        const item: Item = await res.json();
        setForm({
          name: item.name || "",
          description: item.description || "",
          category_id: item.category_id ? String(item.category_id) : "",
          width_cm: item.width_cm ? String(item.width_cm) : "",
          height_cm: item.height_cm ? String(item.height_cm) : "",
          depth_cm: item.depth_cm ? String(item.depth_cm) : "",
          weight_kg: item.weight_kg ? String(item.weight_kg) : "",
          price_desired: item.price_desired ? String(item.price_desired) : "",
          price_min: item.price_min ? String(item.price_min) : "",
          sale_mode: item.sale_mode,
          auction_start_price: item.auction_start_price ? String(item.auction_start_price) : "",
          auction_end_date: item.auction_end_date ? item.auction_end_date : "",
        });
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        description: form.description,
        sale_mode: form.sale_mode,
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
        width_cm: form.width_cm ? parseFloat(form.width_cm) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        depth_cm: form.depth_cm ? parseFloat(form.depth_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        price_desired: form.price_desired ? parseFloat(form.price_desired) : undefined,
        price_min: form.price_min ? parseFloat(form.price_min) : undefined,
        auction_start_price: form.auction_start_price ? parseFloat(form.auction_start_price) : undefined,
        auction_end_date: form.auction_end_date ? new Date(form.auction_end_date).toISOString() : undefined,
      };

      if (body.sale_mode === "auction" && !body.auction_end_date) {
        const oneWeekLater = new Date();
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        body.auction_end_date = oneWeekLater.toISOString();
      }

      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec de la mise à jour");

      router.push(ROUTES.MY_SHOP);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Éditer l’objet #{id}</h1>
            <p className="text-muted-foreground">Modifiez les informations de votre objet</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </div>

        {error && (
          <div className="p-4 border border-red-300 rounded text-red-600 bg-red-50">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-medium border-b pb-2">Informations générales</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Nom de l’objet</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Montre ancienne..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Décrivez votre objet..." />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium border-b pb-2">Dimensions & Poids</h3>
          <div className="grid grid-cols-4 gap-4">
            <div><label className="block text-sm mb-2">Largeur (cm)</label><Input type="number" step="0.1" value={form.width_cm} onChange={(e) => setForm({ ...form, width_cm: e.target.value })} /></div>
            <div><label className="block text-sm mb-2">Hauteur (cm)</label><Input type="number" step="0.1" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /></div>
            <div><label className="block text-sm mb-2">Profondeur (cm)</label><Input type="number" step="0.1" value={form.depth_cm} onChange={(e) => setForm({ ...form, depth_cm: e.target.value })} /></div>
            <div><label className="block text-sm mb-2">Poids (kg)</label><Input type="number" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium border-b pb-2">Prix & Mode de vente</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Prix souhaité (€)</label>
              <Input type="number" step="0.01" value={form.price_desired} onChange={(e) => setForm({ ...form, price_desired: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm mb-2">Prix minimum (€)</label>
              <Input type="number" step="0.01" value={form.price_min} onChange={(e) => setForm({ ...form, price_min: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm mb-2">Mode de vente</label>
              <select
                value={form.sale_mode}
                onChange={(e) => setForm({ ...form, sale_mode: e.target.value as "fast" | "auction" })}
                className="w-full h-10 px-3 border rounded"
              >
                {SALE_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          {form.sale_mode === "auction" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Prix de départ enchère (€)</label>
                <Input type="number" step="0.01" value={form.auction_start_price} onChange={(e) => setForm({ ...form, auction_start_price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm mb-2">Date de fin d’enchère</label>
                <Input type="datetime-local" value={form.auction_end_date} onChange={(e) => setForm({ ...form, auction_end_date: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}