"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Ruler,
  Weight,
  User,
  FolderTree,
  Calendar,
  Clock,
  Tag,
  Image as ImageIcon,
  Star,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ItemPhoto {
  id: number;
  url: string;
  position: number;
  is_primary: boolean;
}

interface ItemCategory {
  id: number;
  category_id: number;
  category?: Category;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  is_default?: boolean;
}

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Item {
  id: number;
  name: string;
  description: string;
  seller_id: number;
  seller?: UserType;
  category_id: number;
  category?: Category;
  itemCategories?: ItemCategory[];
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number;
  price_desired: number;
  price_min: number;
  sale_mode: string;
  status: string;
  auction_start_price: number;
  auction_end_date: string;
  photos: ItemPhoto[];
  created_at: string;
  updated_at: string;
}

const SALE_MODES: Record<string, string> = {
  fixed: "Prix fixe",
  auction: "Enchères",
  negotiable: "Négociable",
  fast: "Vente rapide",
};

const STATUSES: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
  published: { label: "Publié", color: "bg-green-500/20 text-green-400 border-green-500/50" },
  sold: { label: "Vendu", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  pending_expertise: { label: "Attend expertise", color: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Item>>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // Photo viewer
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
    fetchCategories();
    fetchUsers();
  }, [itemId]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItem(data);
        initEditForm(data);
      } else {
        setError("Article non trouvé");
      }
    } catch (err) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const initEditForm = (data: Item) => {
    setEditForm({
      name: data.name,
      description: data.description,
      seller_id: data.seller_id,
      category_id: data.category_id,
      width_cm: data.width_cm,
      height_cm: data.height_cm,
      depth_cm: data.depth_cm,
      weight_kg: data.weight_kg,
      price_desired: data.price_desired,
      price_min: data.price_min,
      sale_mode: data.sale_mode,
      status: data.status,
      auction_start_price: data.auction_start_price,
      auction_end_date: data.auction_end_date,
    });
    
    const catIds = new Set<number>();
    if (data.category_id) catIds.add(data.category_id);
    if (data.itemCategories) {
      data.itemCategories.forEach((ic) => catIds.add(ic.category_id));
    }
    setSelectedCategoryIds(catIds);
  };

  const toggleCategory = (categoryId: number) => {
    const newSelected = new Set(selectedCategoryIds);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
      if (editForm.category_id === categoryId) {
        const remaining = Array.from(newSelected);
        setEditForm({ ...editForm, category_id: remaining.length > 0 ? remaining[0] : undefined });
      }
    } else {
      newSelected.add(categoryId);
      if (!editForm.category_id) {
        setEditForm({ ...editForm, category_id: categoryId });
      }
    }
    setSelectedCategoryIds(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");

      // Prepare data with proper number conversion
      const dataToSend: any = {
        name: editForm.name,
        description: editForm.description,
        seller_id: editForm.seller_id,
        category_id: editForm.category_id,
        sale_mode: editForm.sale_mode,
        status: editForm.status,
      };

      // Convert numeric fields (handle both comma and dot decimals)
      const toNumber = (val: any) => {
        if (val === undefined || val === null || val === "") return undefined;
        const str = String(val).replace(",", ".");
        const num = parseFloat(str);
        return isNaN(num) ? undefined : num;
      };

      if (editForm.width_cm !== undefined) dataToSend.width_cm = toNumber(editForm.width_cm);
      if (editForm.height_cm !== undefined) dataToSend.height_cm = toNumber(editForm.height_cm);
      if (editForm.depth_cm !== undefined) dataToSend.depth_cm = toNumber(editForm.depth_cm);
      if (editForm.weight_kg !== undefined) dataToSend.weight_kg = toNumber(editForm.weight_kg);
      if (editForm.price_desired !== undefined) dataToSend.price_desired = toNumber(editForm.price_desired);
      if (editForm.price_min !== undefined) dataToSend.price_min = toNumber(editForm.price_min);
      if (editForm.auction_start_price !== undefined) dataToSend.auction_start_price = toNumber(editForm.auction_start_price);
      if (editForm.auction_end_date) dataToSend.auction_end_date = new Date(editForm.auction_end_date).toISOString();

      // Update item
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Échec de la mise à jour");
      }

      // Update categories
      if (selectedCategoryIds.size > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}/categories`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category_ids: Array.from(selectedCategoryIds),
          }),
        });
      }

      await fetchItem();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/admin/items");
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.name || `ID: ${id}`;
  };

  const getSellerName = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : `ID: ${id}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">{error}</p>
          <Button
            onClick={() => router.push("/admin/items")}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux articles
          </Button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const primaryPhoto = item.photos?.find((p) => p.is_primary) || item.photos?.[0];
  const status = STATUSES[item.status] || { label: item.status, color: "bg-slate-500/20 text-slate-400" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/items")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{item.name}</h1>
            <p className="text-slate-400">ID: {item.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  initEditForm(item);
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photos */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Photo */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            {item.photos && item.photos.length > 0 ? (
              <div className="relative aspect-square">
                <img
                  src={item.photos[currentPhotoIndex]?.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : item.photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentPhotoIndex((prev) => (prev < item.photos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {item.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPhotoIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {item.photos[currentPhotoIndex]?.is_primary && (
                  <div className="absolute top-4 left-4 px-2 py-1 bg-purple-500 rounded-full text-white text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Principale
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-slate-900">
                <ImageIcon className="w-16 h-16 text-slate-600" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {item.photos && item.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    idx === currentPhotoIndex ? "border-purple-500" : "border-transparent"
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Statut</h3>
            {isEditing ? (
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              >
                {Object.entries(STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : (
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informations générales</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nom</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                </div>
                <div>
                  <p className="text-slate-300 whitespace-pre-wrap">{item.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-orange-400" />
              Catégories
            </h2>
            
            {isEditing ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.filter((c) => !c.parent_id).map((rootCat) => {
                  const subcats = categories.filter((c) => c.parent_id === rootCat.id);
                  const isSelected = selectedCategoryIds.has(rootCat.id);
                  
                  return (
                    <div key={rootCat.id}>
                      <button
                        type="button"
                        onClick={() => toggleCategory(rootCat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                          isSelected ? "bg-purple-500/20 text-purple-300" : "hover:bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-purple-500 border-purple-500" : "border-slate-600"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <FolderTree className="w-4 h-4 text-orange-400" />
                        {rootCat.name}
                        {editForm.category_id === rootCat.id && <Star className="w-3 h-3 text-purple-400 ml-auto" />}
                      </button>
                      {subcats.map((subCat) => {
                        const isSubSelected = selectedCategoryIds.has(subCat.id);
                        return (
                          <button
                            key={subCat.id}
                            type="button"
                            onClick={() => toggleCategory(subCat.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 pl-10 rounded-lg text-left ${
                              isSubSelected ? "bg-purple-500/20 text-purple-300" : "hover:bg-slate-700/50 text-slate-400"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSubSelected ? "bg-purple-500 border-purple-500" : "border-slate-600"
                            }`}>
                              {isSubSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <FolderTree className="w-4 h-4 text-purple-400" />
                            {subCat.name}
                            {editForm.category_id === subCat.id && <Star className="w-3 h-3 text-purple-400 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {item.itemCategories && item.itemCategories.length > 0 ? (
                  item.itemCategories.map((ic) => (
                    <span
                      key={ic.id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                        ic.category_id === item.category_id
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      <FolderTree className="w-3 h-3" />
                      {getCategoryName(ic.category_id)}
                      {ic.category_id === item.category_id && <Star className="w-3 h-3 fill-current" />}
                    </span>
                  ))
                ) : item.category_id ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/50">
                    <FolderTree className="w-3 h-3" />
                    {getCategoryName(item.category_id)}
                    <Star className="w-3 h-3 fill-current" />
                  </span>
                ) : (
                  <span className="text-slate-500">Aucune catégorie</span>
                )}
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Prix
            </h2>
            
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Prix souhaité (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price_desired}
                    onChange={(e) => setEditForm({ ...editForm, price_desired: parseFloat(e.target.value) })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Prix minimum (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price_min}
                    onChange={(e) => {
                      const newPriceMin = parseFloat(e.target.value);
                      const updates: any = { price_min: newPriceMin };
                      
                      // Auto-update auction start price if in auction mode
                      if (editForm.sale_mode === "auction" && !isNaN(newPriceMin) && newPriceMin > 0) {
                        updates.auction_start_price = Math.round(newPriceMin * 0.9 * 100) / 100; // -10%
                      }
                      
                      setEditForm({ ...editForm, ...updates });
                    }}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Mode de vente</label>
                  <select
                    value={editForm.sale_mode}
                    onChange={(e) => {
                      const newMode = e.target.value;
                      const updates: any = { sale_mode: newMode };
                      
                      // Auto-fill auction start price as -10% of price_min when switching to auction
                      if (newMode === "auction" && editForm.price_min) {
                        const priceMin = typeof editForm.price_min === "string" 
                          ? parseFloat(String(editForm.price_min).replace(",", "."))
                          : editForm.price_min;
                        if (!isNaN(priceMin) && priceMin > 0) {
                          updates.auction_start_price = Math.round(priceMin * 0.9 * 100) / 100; // -10%
                        }
                      }
                      
                      setEditForm({ ...editForm, ...updates });
                    }}
                    className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  >
                    {Object.entries(SALE_MODES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                {editForm.sale_mode === "auction" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Prix de départ enchère (€) <span className="text-purple-400 text-xs">(auto: -10% prix min)</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.auction_start_price}
                        onChange={(e) => setEditForm({ ...editForm, auction_start_price: parseFloat(e.target.value) })}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Date fin enchère</label>
                      <Input
                        type="datetime-local"
                        value={editForm.auction_end_date ? editForm.auction_end_date.slice(0, 16) : ""}
                        onChange={(e) => setEditForm({ ...editForm, auction_end_date: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-500/10 rounded-xl">
                  <p className="text-green-400 text-sm mb-1">Prix souhaité</p>
                  <p className="text-2xl font-bold text-white">{item.price_desired} €</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Prix minimum</p>
                  <p className="text-xl font-semibold text-white">{item.price_min || "-"} €</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Mode de vente</p>
                  <p className="text-lg font-medium text-white">{SALE_MODES[item.sale_mode] || item.sale_mode}</p>
                </div>
                {item.sale_mode === "auction" && (
                  <div className="p-4 bg-purple-500/10 rounded-xl">
                    <p className="text-purple-400 text-sm mb-1">Prix départ enchère</p>
                    <p className="text-xl font-semibold text-white">{item.auction_start_price || "-"} €</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-400" />
              Dimensions & Poids
            </h2>
            
            {isEditing ? (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Largeur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.width_cm}
                    onChange={(e) => setEditForm({ ...editForm, width_cm: parseFloat(e.target.value) })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Hauteur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.height_cm}
                    onChange={(e) => setEditForm({ ...editForm, height_cm: parseFloat(e.target.value) })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Profondeur (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.depth_cm}
                    onChange={(e) => setEditForm({ ...editForm, depth_cm: parseFloat(e.target.value) })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Poids (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.weight_kg}
                    onChange={(e) => setEditForm({ ...editForm, weight_kg: parseFloat(e.target.value) })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Largeur</p>
                    <p className="text-white font-medium">{item.width_cm || "-"} cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-blue-400 rotate-90" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Hauteur</p>
                    <p className="text-white font-medium">{item.height_cm || "-"} cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Profondeur</p>
                    <p className="text-white font-medium">{item.depth_cm || "-"} cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Weight className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Poids</p>
                    <p className="text-white font-medium">{item.weight_kg || "-"} kg</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seller & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Vendeur
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {item.seller ? `${item.seller.first_name[0]}${item.seller.last_name[0]}` : "?"}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {item.seller ? `${item.seller.first_name} ${item.seller.last_name}` : getSellerName(item.seller_id)}
                  </p>
                  <p className="text-slate-400 text-sm">{item.seller?.email || `ID: ${item.seller_id}`}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Dates
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Créé le</span>
                  <span className="text-white text-sm">{formatDate(item.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Modifié le</span>
                  <span className="text-white text-sm">{formatDate(item.updated_at)}</span>
                </div>
                {item.auction_end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Fin enchère</span>
                    <span className="text-orange-400 text-sm">{formatDate(item.auction_end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Supprimer l'article</h2>
                <p className="text-slate-400 text-sm">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">
              Êtes-vous sûr de vouloir supprimer "<strong>{item.name}</strong>" ? 
              Toutes les données associées seront perdues.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

