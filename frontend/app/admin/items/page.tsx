"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  X,
  DollarSign,
  Tag,
  Ruler,
  Weight,
  User,
  FolderTree,
  Image,
  Upload,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ItemPhoto {
  id: number;
  url: string;
  position: number;
  is_primary: boolean;
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
  price_min: number;
  sale_mode: string;
  status: string;
  auction_start_price: number;
  auction_end_date: string;
  photos: ItemPhoto[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface ItemForm {
  name: string;
  description: string;
  seller_id: string;
  category_id: string;
  width_cm: string;
  height_cm: string;
  depth_cm: string;
  weight_kg: string;
  price_desired: string;
  price_min: string;
  sale_mode: string;
  status: string;
  auction_start_price: string;
  auction_end_date: string;
}

const initialForm: ItemForm = {
  name: "",
  description: "",
  seller_id: "",
  category_id: "",
  width_cm: "",
  height_cm: "",
  depth_cm: "",
  weight_kg: "",
  price_desired: "",
  price_min: "",
  sale_mode: "fixed",
  status: "draft",
  auction_start_price: "",
  auction_end_date: "",
};

const SALE_MODES = [
  { value: "fixed", label: "Prix fixe" },
  { value: "auction", label: "Enchères" },
  { value: "negotiable", label: "Négociable" },
];

const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "sold", label: "Vendu" },
  { value: "archived", label: "Archivé" },
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Photos state
  const [photos, setPhotos] = useState<ItemPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(initialForm);
    setPhotos([]);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      seller_id: item.seller_id?.toString() || "",
      category_id: item.category_id?.toString() || "",
      width_cm: item.width_cm?.toString() || "",
      height_cm: item.height_cm?.toString() || "",
      depth_cm: item.depth_cm?.toString() || "",
      weight_kg: item.weight_kg?.toString() || "",
      price_desired: item.price_desired?.toString() || "",
      price_min: item.price_min?.toString() || "",
      sale_mode: item.sale_mode || "fixed",
      status: item.status || "draft",
      auction_start_price: item.auction_start_price?.toString() || "",
      auction_end_date: item.auction_end_date ? item.auction_end_date.slice(0, 16) : "",
    });
    setPhotos(item.photos || []);
    setError("");
    setShowModal(true);
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

        const res = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Échec du téléchargement");
        }

        const newPhoto: ItemPhoto = {
          id: Date.now() + i, // Temporary ID for new photos
          url: `http://localhost:3001${data.url}`,
          position: photos.length + i,
          is_primary: photos.length === 0 && i === 0,
        };

        setPhotos((prev) => [...prev, newPhoto]);

        // If editing, add photo to item immediately
        if (editingItem) {
          const token = localStorage.getItem("access_token");
          await fetch(`http://localhost:3001/items/${editingItem.id}/photos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: `http://localhost:3001${data.url}`,
              is_primary: photos.length === 0 && i === 0,
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Échec du téléchargement");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = async (photo: ItemPhoto, index: number) => {
    if (editingItem && photo.id > 1000000) {
      // Real photo from DB
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`http://localhost:3001/items/${editingItem.id}/photos/${photo.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to delete photo:", err);
      }
    }

    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed primary, set first as primary
      if (photo.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimary = async (index: number) => {
    const photo = photos[index];
    
    if (editingItem && photo.id > 1000000) {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`http://localhost:3001/items/${editingItem.id}/photos/${photo.id}/primary`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to set primary:", err);
      }
    }

    setPhotos((prev) =>
      prev.map((p, i) => ({
        ...p,
        is_primary: i === index,
      }))
    );
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      const isEdit = !!editingItem;

      const body: any = {
        name: form.name,
        description: form.description,
        sale_mode: form.sale_mode,
        status: form.status,
      };

      if (form.seller_id) body.seller_id = parseInt(form.seller_id);
      if (form.category_id) body.category_id = parseInt(form.category_id);
      if (form.width_cm) body.width_cm = parseFloat(form.width_cm);
      if (form.height_cm) body.height_cm = parseFloat(form.height_cm);
      if (form.depth_cm) body.depth_cm = parseFloat(form.depth_cm);
      if (form.weight_kg) body.weight_kg = parseFloat(form.weight_kg);
      if (form.price_desired) body.price_desired = parseFloat(form.price_desired);
      if (form.price_min) body.price_min = parseFloat(form.price_min);
      if (form.auction_start_price) body.auction_start_price = parseFloat(form.auction_start_price);
      if (form.auction_end_date) body.auction_end_date = new Date(form.auction_end_date).toISOString();

      const url = isEdit
        ? `http://localhost:3001/items/${editingItem.id}`
        : "http://localhost:3001/items";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Échec de l'enregistrement");
      }

      // If creating, add photos to the new item
      if (!isEdit && photos.length > 0) {
        for (const photo of photos) {
          await fetch(`http://localhost:3001/items/${data.id}/photos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: photo.url,
              is_primary: photo.is_primary,
            }),
          });
        }
      }

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3001/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400";
      case "draft":
        return "bg-amber-500/20 text-amber-400";
      case "sold":
        return "bg-blue-500/20 text-blue-400";
      case "archived":
        return "bg-slate-500/20 text-slate-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const found = STATUSES.find((s) => s.value === status);
    return found ? found.label : status;
  };

  const getSaleModeLabel = (mode: string) => {
    const found = SALE_MODES.find((m) => m.value === mode);
    return found ? found.label : mode;
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "-";
  };

  const getSellerName = (sellerId: number) => {
    const user = users.find((u) => u.id === sellerId);
    return user ? `${user.first_name} ${user.last_name}` : "-";
  };

  const getPrimaryPhoto = (item: Item) => {
    if (!item.photos || item.photos.length === 0) return null;
    const primary = item.photos.find((p) => p.is_primary);
    return primary || item.photos[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            Gestion des Articles
          </h1>
          <p className="text-slate-400 mt-1">{items.length} articles</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
          <Button
            onClick={fetchItems}
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Rechercher des articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
        />
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
              <div className="w-full h-32 bg-slate-700 rounded-xl mb-4" />
              <div className="w-3/4 h-5 bg-slate-700 rounded mb-2" />
              <div className="w-1/2 h-4 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun article trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const primaryPhoto = getPrimaryPhoto(item);
            return (
              <div
                key={item.id}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300"
              >
                {/* Photo */}
                <div className="relative h-48 bg-slate-700">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.photos && item.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                      {item.photos.length} photos
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FolderTree className="w-3 h-3" />
                      <span className="truncate">{getCategoryName(item.category_id)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <User className="w-3 h-3" />
                      <span className="truncate">{getSellerName(item.seller_id)}</span>
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white font-semibold">{item.price_desired} €</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400 text-sm">{getSaleModeLabel(item.sale_mode)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-700/50 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? "Modifier l'article" : "Créer un article"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {/* Photos Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Photos (1-10)
                </h3>
                
                <div className="grid grid-cols-5 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                        photo.is_primary ? "border-purple-500" : "border-slate-700"
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
                          className={`p-1.5 rounded-full ${
                            photo.is_primary
                              ? "bg-purple-500 text-white"
                              : "bg-white/20 text-white hover:bg-white/40"
                          }`}
                          title="Définir comme principale"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePhoto(photo, index)}
                          className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {photo.is_primary && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-500 rounded text-white text-xs">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload button */}
                  {photos.length < 10 && (
                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto ? (
                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500" />
                          <span className="text-slate-500 text-xs">Ajouter</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <p className="text-slate-500 text-xs">
                  {photos.length}/10 photos • Cliquez sur ⭐ pour définir la photo principale
                </p>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                  Informations générales
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Nom de l'article <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                    placeholder="Ex: Canapé en cuir vintage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-24 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="Décrivez votre article..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Vendeur
                    </label>
                    <select
                      value={form.seller_id}
                      onChange={(e) => setForm({ ...form, seller_id: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Sélectionner un vendeur</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                  Dimensions & Poids
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Largeur (cm)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.width_cm}
                      onChange={(e) => setForm({ ...form, width_cm: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Hauteur (cm)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.height_cm}
                      onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Profondeur (cm)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.depth_cm}
                      onChange={(e) => setForm({ ...form, depth_cm: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Poids (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.weight_kg}
                      onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                  Prix & Mode de vente
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Prix souhaité (€) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price_desired}
                      onChange={(e) => setForm({ ...form, price_desired: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Prix minimum (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price_min}
                      onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Mode de vente
                    </label>
                    <select
                      value={form.sale_mode}
                      onChange={(e) => setForm({ ...form, sale_mode: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      {SALE_MODES.map((mode) => (
                        <option key={mode.value} value={mode.value}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auction fields */}
                {form.sale_mode === "auction" && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Prix de départ enchère (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.auction_start_price}
                        onChange={(e) => setForm({ ...form, auction_start_price: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Date de fin d'enchère
                      </label>
                      <Input
                        type="datetime-local"
                        value={form.auction_end_date}
                        onChange={(e) => setForm({ ...form, auction_end_date: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                  Statut
                </h3>
                <div className="flex gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: status.value })}
                      className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.status === status.value
                          ? "bg-purple-500/20 border-purple-500 text-purple-400"
                          : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {saving ? "Enregistrement..." : editingItem ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
