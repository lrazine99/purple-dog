"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import Footer from "@/components/homepage/footer";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Upload,
  Image as ImageIcon,
  FolderTree,
  Star,
  DollarSign,
  Loader2,
} from "lucide-react";
import { ROUTES } from "@/helper/routes";

interface ItemPhoto {
  id: number;
  url: string;
  position: number;
  is_primary: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  is_default?: boolean;
}

interface Item {
  id: number;
  name: string;
  description: string;
  seller_id: number;
  category_id: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number;
  price_desired: number;
  price_min?: number;
  sale_mode: "auction" | "fast";
  status: string;
  auction_start_price?: number | null;
  auction_end_date?: string | null;
  photos?: ItemPhoto[];
  created_at: string;
  updated_at: string;
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

export default function MyShopPage() {
  const { data: user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ItemForm>(initialForm);
  const [photos, setPhotos] = useState<ItemPhoto[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    new Set()
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const SALE_MODES = useMemo(
    () => [
      { value: "fast", label: "Vente rapide" },
      { value: "auction", label: "Enchères" },
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      try {
        if (!user) return;
        await Promise.all([fetchCategories(), fetchItems()]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const fetchItems = async () => {
    try {
      if (!user) return;
      const res = await fetch("/api/items", {
        credentials: "include",
      });
      if (!res.ok) return;
      const all = await res.json();
      setItems(
        Array.isArray(all)
          ? all.filter((i: Item) => i.seller_id === user.id)
          : []
      );
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        credentials: "include",
      });
      if (!res.ok) return;
      setCategories(await res.json());
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const next = new Set(selectedCategoryIds);
    if (next.has(categoryId)) {
      next.delete(categoryId);
      if (form.category_id === categoryId.toString()) {
        const remaining = Array.from(next);
        setForm({
          ...form,
          category_id: remaining.length ? remaining[0].toString() : "",
        });
      }
    } else {
      next.add(categoryId);
      if (!form.category_id)
        setForm({ ...form, category_id: categoryId.toString() });
    }
    setSelectedCategoryIds(next);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photos.length + files.length > 10) {
      setError("Maximum 10 photos par article");
      return;
    }
    setUploadingPhoto(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Échec du téléchargement");
        const newPhoto: ItemPhoto = {
          id: Date.now() + i,
          url: data.url,
          position: photos.length + i,
          is_primary: photos.length === 0 && i === 0,
        };
        setPhotos((prev) => [...prev, newPhoto]);
      }
    } catch (err: any) {
      setError(err.message || "Échec du téléchargement");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingDocument(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Échec du téléchargement");
        setDocuments((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message || "Échec du téléchargement");
    } finally {
      setUploadingDocument(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.is_primary && updated.length > 0)
        updated[0].is_primary = true;
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setPhotos((prev) =>
      prev.map((p, i) => ({ ...p, is_primary: i === index }))
    );
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      if (!user) throw new Error("Non authentifié");
      if (photos.length < 10) {
        setError(
          "Veuillez ajouter au moins 10 photos (avant, arrière, dessus, dessous, signature, tranches, etc.)"
        );
        setSaving(false);
        return;
      }

      const priceMin = form.price_min ? parseFloat(form.price_min) : null;
      const body: any = {
        name: form.name,
        description: form.description,
        seller_id: user.id,
        sale_mode: form.sale_mode,
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
        width_cm: form.width_cm ? parseFloat(form.width_cm) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        depth_cm: form.depth_cm ? parseFloat(form.depth_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        price_desired: form.price_desired ? parseFloat(form.price_desired) : undefined,
        price_min: priceMin && priceMin >= 0 ? priceMin : undefined,
        auction_start_price: form.auction_start_price ? parseFloat(form.auction_start_price) : undefined,
        auction_end_date: form.auction_end_date ? new Date(form.auction_end_date).toISOString() : undefined,
        status: "draft",
      };

      if (body.sale_mode === "auction" && !body.auction_end_date) {
        const oneWeekLater = new Date();
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        body.auction_end_date = oneWeekLater.toISOString();
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec de la création");

      for (const photo of photos) {
        await fetch(`/api/items/${data.id}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url: photo.url, is_primary: photo.is_primary }),
        });
      }

      if (selectedCategoryIds.size > 0) {
        await fetch(`/api/items/${data.id}/categories`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ category_ids: Array.from(selectedCategoryIds) }),
        });
      }

      setForm(initialForm);
      setPhotos([]);
      setDocuments([]);
      setSelectedCategoryIds(new Set());
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ma Boutique</h1>
            <p className="text-muted-foreground">
              Ajoutez vos objets et gérez vos annonces
            </p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href={ROUTES.MY_SHOP_NEW}>Ajouter un produit</Link>
          </Button>
        </div>

        {error && (
          <div className="p-4 border border-red-300 rounded text-red-600 bg-red-50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 hidden">
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">
                Photos (10 minimum)
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                      photo.is_primary
                        ? "border-purple-500"
                        : "border-slate-300"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleSetPrimary(index)}
                        className={`p-1.5 rounded ${
                          photo.is_primary
                            ? "bg-purple-600 text-white"
                            : "bg-white/20 text-white hover:bg-white/40"
                        }`}
                        title="Définir comme principale"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="p-1.5 rounded bg-red-500/80 text-white hover:bg-red-500"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                    {photo.is_primary && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-600 rounded text-white text-xs">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
                {photos.length < 10 && (
                  <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500" />
                        <span className="text-slate-500 text-xs">Ajouter</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {photos.length}/10 photos • Minimum 10 • Cliquez sur ⭐ pour
                définir la photo principale
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">
                Informations générales
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de l’objet
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Montre ancienne..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Décrivez votre objet..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégories (plusieurs possibles)
                </label>
                <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-1">
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((root) => {
                      const subs = categories.filter(
                        (c) => c.parent_id === root.id
                      );
                      const isRootSelected = selectedCategoryIds.has(root.id);
                      return (
                        <div key={root.id}>
                          <button
                            type="button"
                            onClick={() => toggleCategory(root.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                              isRootSelected
                                ? "bg-purple-100 text-purple-700"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <FolderTree className="w-4 h-4" />
                            {root.name}
                            {form.category_id === root.id.toString() && (
                              <Star className="w-3 h-3 ml-auto text-purple-600" />
                            )}
                          </button>
                          {subs.map((sub) => {
                            const isSel = selectedCategoryIds.has(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleCategory(sub.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 pl-8 rounded text-left ${
                                  isSel
                                    ? "bg-purple-100 text-purple-700"
                                    : "hover:bg-slate-100 text-slate-600"
                                }`}
                              >
                                <FolderTree className="w-4 h-4" />
                                {sub.name}
                                {form.category_id === sub.id.toString() && (
                                  <Star className="w-3 h-3 ml-auto text-purple-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
                {selectedCategoryIds.size > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Star className="w-3 h-3 inline text-purple-600" /> =
                    Catégorie principale
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">
                Dimensions & Poids
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm mb-2">Largeur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.width_cm}
                    onChange={(e) =>
                      setForm({ ...form, width_cm: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Hauteur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(e) =>
                      setForm({ ...form, height_cm: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Profondeur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.depth_cm}
                    onChange={(e) =>
                      setForm({ ...form, depth_cm: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Poids (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) =>
                      setForm({ ...form, weight_kg: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">
                Prix & Mode de vente
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    Prix souhaité (€) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_desired}
                    onChange={(e) =>
                      setForm({ ...form, price_desired: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Prix minimum (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_min}
                    onChange={(e) => {
                      const newMin = e.target.value;
                      const updates: any = { price_min: newMin };
                      if (form.sale_mode === "auction" && newMin) {
                        const n = parseFloat(newMin.replace(",", "."));
                        if (!isNaN(n) && n > 0)
                          updates.auction_start_price = (
                            Math.round(n * 0.9 * 100) / 100
                          ).toString();
                      }
                      setForm({ ...form, ...updates });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Mode de vente</label>
                  <select
                    value={form.sale_mode}
                    onChange={(e) => {
                      const newMode = e.target.value as "fast" | "auction";
                      const updates: any = { sale_mode: newMode };
                      if (newMode === "auction" && form.price_min) {
                        const n = parseFloat(form.price_min.replace(",", "."));
                        if (!isNaN(n) && n > 0)
                          updates.auction_start_price = (
                            Math.round(n * 0.9 * 100) / 100
                          ).toString();
                      }
                      setForm({ ...form, ...updates });
                    }}
                    className="w-full h-10 px-3 border rounded"
                  >
                    {SALE_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {form.sale_mode === "auction" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Prix de départ enchère (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.auction_start_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          auction_start_price: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      Date de fin d’enchère
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.auction_end_date}
                      onChange={(e) =>
                        setForm({ ...form, auction_end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">
                Déposer des documents (certificat, preuve d’achat…)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <a
                      href={doc}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm truncate mr-2"
                    >
                      {doc}
                    </a>
                    <button
                      onClick={() => handleRemoveDocument(index)}
                      className="p-1 rounded bg-red-500/80 text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <label className="relative col-span-1 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    onChange={handleDocumentUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingDocument}
                  />
                  {uploadingDocument ? (
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500" />
                      <span className="text-slate-500 text-xs">Ajouter</span>
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Formats acceptés: PDF, JPG, PNG (max 10Mo)
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="border rounded p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Vos produits
              </h3>
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucun produit pour le moment
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
