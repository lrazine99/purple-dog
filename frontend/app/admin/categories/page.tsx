"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  ChevronRight,
  ChevronDown,
  X,
  Package,
  DollarSign,
  Eye,
  ExternalLink,
  Check,
  Loader2,
  ArrowRightLeft,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  is_default?: boolean;
}

interface CategoryTree extends Category {
  children: CategoryTree[];
  expanded?: boolean;
}

interface ItemCategory {
  id: number;
  category_id: number;
  category?: Category;
}

interface Item {
  id: number;
  name: string;
  description: string;
  price_desired: number;
  status: string;
  category_id: number;
  itemCategories?: ItemCategory[];
  photos?: { url: string; is_primary: boolean }[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Category items panel
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryItems, setCategoryItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Add articles modal
  const [showAddArticles, setShowAddArticles] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [searchArticles, setSearchArticles] = useState("");
  const [savingArticles, setSavingArticles] = useState(false);

  // Move article modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [itemToMove, setItemToMove] = useState<Item | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [movingItem, setMovingItem] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    try {
      const res = await fetch('/api/items', {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAllItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const fetchCategoryItems = async (categoryId: number) => {
    setLoadingItems(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const items = await res.json();
        setAllItems(items);

        // Get the selected category and its subcategories
        const selectedCat = categories.find((c) => c.id === categoryId);
        const subcategoryIds = categories
          .filter((c) => c.parent_id === categoryId)
          .map((c) => c.id);

        // Include the category itself and all its subcategories
        const allCategoryIds = [categoryId, ...subcategoryIds];

        // Filter items that belong to this category OR any of its subcategories
        const filtered = items.filter((item: Item) => {
          // Check primary category
          if (allCategoryIds.includes(item.category_id)) return true;
          // Check itemCategories array
          if (item.itemCategories) {
            return item.itemCategories.some((ic) => allCategoryIds.includes(ic.category_id));
          }
          return false;
        });
        setCategoryItems(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryItems(category.id);
  };

  const openAddArticlesModal = () => {
    setShowAddArticles(true);
    setSelectedItemIds(new Set());
    setSearchArticles("");
    if (allItems.length === 0) {
      fetchAllItems();
    }
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleAddArticlesToCategory = async () => {
    if (!selectedCategory || selectedItemIds.size === 0) return;

    setSavingArticles(true);
    try {
      const token = localStorage.getItem("access_token");

      // Add category to each selected item using the new endpoint
      for (const itemId of selectedItemIds) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemId}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category_ids: [selectedCategory.id] }),
        });
      }

      // Refresh the category items
      await fetchCategoryItems(selectedCategory.id);
      setShowAddArticles(false);
      setSelectedItemIds(new Set());
    } catch (error) {
      console.error("Failed to add articles:", error);
    } finally {
      setSavingArticles(false);
    }
  };

  // Remove article from current category
  const handleRemoveFromCategory = async (item: Item) => {
    if (!selectedCategory) return;
    
    if (!confirm(`Retirer "${item.name}" de la catégorie "${selectedCategory.name}" ?`)) return;

    try {
      const token = localStorage.getItem("access_token");
      
      // Get the default category "Autre"
      const defaultCat = categories.find((c) => c.is_default);
      
      // Remove from current category and add to "Autre" if needed
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${item.id}/categories/${selectedCategory.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // If item had only this category, it will be orphan - add to "Autre"
      if (defaultCat && item.category_id === selectedCategory.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category_id: defaultCat.id }),
        });
      }

      // Refresh
      await fetchCategoryItems(selectedCategory.id);
    } catch (error) {
      console.error("Failed to remove article:", error);
    }
  };

  // Open move modal
  const openMoveModal = (item: Item) => {
    setItemToMove(item);
    setTargetCategoryId(null);
    setShowMoveModal(true);
  };

  // Move article to another category
  const handleMoveToCategory = async () => {
    if (!itemToMove || !targetCategoryId || !selectedCategory) return;

    setMovingItem(true);
    try {
      const token = localStorage.getItem("access_token");

      // Update the item's primary category
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemToMove.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_id: targetCategoryId }),
      });

      // Remove from current category if different
      if (selectedCategory.id !== targetCategoryId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemToMove.id}/categories/${selectedCategory.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        // Add to new category
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${itemToMove.id}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category_ids: [targetCategoryId] }),
        });
      }

      // Refresh and close modal
      await fetchCategoryItems(selectedCategory.id);
      setShowMoveModal(false);
      setItemToMove(null);
    } catch (error) {
      console.error("Failed to move article:", error);
    } finally {
      setMovingItem(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategory.trim()) return;

    try {
      const body: any = { name: newCategory };
      if (selectedParent) {
        body.parent_id = selectedParent;
      }

      const res = await fetch('/api/categories', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNewCategory("");
        setSelectedParent(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const categoryToDelete = categories.find((c) => c.id === id);
    
    // Can't delete default category
    if (categoryToDelete?.is_default) {
      alert("Impossible de supprimer la catégorie par défaut \"Autre\"");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?\n\nLes articles de cette catégorie seront automatiquement déplacés vers \"Autre\".")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        if (selectedCategory?.id === id) {
          setSelectedCategory(null);
          setCategoryItems([]);
        }
        // Refresh to get updated item counts
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Build tree structure
  const buildTree = (items: Category[], parentId: number | null = null): CategoryTree[] => {
    return items
      .filter((item) => item.parent_id === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const categoryTree = buildTree(categories);
  const rootCategories = categories.filter((c) => c.parent_id === null);

  const filteredTree = search
    ? categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  // Filter available articles (not already in current category)
  const availableItems = allItems.filter((item) => {
    if (!selectedCategory) return true;
    // Check if item already has this category
    if (item.category_id === selectedCategory.id) return false;
    if (item.itemCategories) {
      return !item.itemCategories.some((ic) => ic.category_id === selectedCategory.id);
    }
    return true;
  });

  const filteredAvailableItems = searchArticles
    ? availableItems.filter((item) =>
        item.name.toLowerCase().includes(searchArticles.toLowerCase())
      )
    : availableItems;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400";
      case "draft":
        return "bg-amber-500/20 text-amber-400";
      case "sold":
        return "bg-blue-500/20 text-blue-400";
      case "pending_expertise":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Publié";
      case "draft":
        return "Brouillon";
      case "sold":
        return "Vendu";
      case "pending_expertise":
        return "Attend expertise";
      default:
        return status;
    }
  };

  const renderCategory = (category: CategoryTree & { is_default?: boolean }, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isSelected = selectedCategory?.id === category.id;
    const isDefault = category.is_default;
    const isSubcategory = category.parent_id !== null; // Subcategories can't have children

    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors cursor-pointer ${
            level > 0 ? "border-l-2 border-slate-700 ml-6" : ""
          } ${isSelected ? "bg-purple-500/10 border-l-2 border-purple-500" : ""} ${isDefault ? "bg-emerald-500/5" : ""}`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center gap-3 flex-1" onClick={() => handleCategoryClick(category)}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(category.id);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDefault
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                  : level === 0
                  ? "bg-gradient-to-br from-orange-500 to-amber-500"
                  : "bg-gradient-to-br from-purple-500 to-indigo-500"
              }`}
            >
              <FolderTree className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  {category.name}
                  {isDefault && (
                    <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                      Par défaut
                    </span>
                  )}
                </p>
                <p className="text-slate-400 text-sm">
                  ID: {category.id}
                  {hasChildren && ` • ${category.children.length} subcategories`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick(category);
              }}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              Articles
            </Button>
            {/* Only root categories can have subcategories (max 2 levels) */}
            {!isSubcategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedParent(category.id);
                  document.getElementById("new-category-input")?.focus();
                }}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Sub
              </Button>
            )}
            {!isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-700/50">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-orange-600" />
              Gestion des Catégories
            </h1>
            <p className="text-gray-600 mt-1">{categories.length} catégories</p>
          </div>
          <Button
            onClick={fetchCategories}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Add Category */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ajouter {selectedParent ? "une sous-catégorie" : "une catégorie"}
          </h2>

          {selectedParent && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-gray-600 text-sm">Parent :</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {categories.find((c) => c.id === selectedParent)?.name}
              </span>
              <button
                onClick={() => setSelectedParent(null)}
                className="text-gray-600 hover:text-gray-900 text-sm underline"
              >
                Effacer
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="new-category-input"
                placeholder={selectedParent ? "Nom de la sous-catégorie..." : "Nom de la catégorie..."}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedParent || ""}
              onChange={(e) => setSelectedParent(e.target.value ? Number(e.target.value) : null)}
              className="h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Sans parent (catégorie racine)</option>
              {/* Only show root categories as parents (max 2 levels) */}
              {rootCategories.filter(cat => !cat.is_default).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button
              onClick={handleCreate}
              className="h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher des catégories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Categories Tree */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-40 h-5 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucune catégorie trouvée</p>
            </div>
          ) : search ? (
            <div className="divide-y divide-slate-700/50">
              {filteredTree?.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400">Aucune catégorie correspondante</p>
                </div>
              ) : (
                filteredTree?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{category.name}</p>
                        <p className="text-slate-400 text-sm">
                          ID: {category.id}
                          {category.parent_id && ` • Parent: ${category.parent_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {categoryTree.map((category) => renderCategory(category))}
            </div>
          )}
        </div>
      </div>

      {/* Items Modal Popup */}
      {selectedCategory && !showAddArticles && (() => {
        // Get subcategories for header display
        const subcats = categories.filter((c) => c.parent_id === selectedCategory.id);
        const isParentCategory = subcats.length > 0;
        
        return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Articles de "{selectedCategory.name}"</h2>
                  <p className="text-slate-400 text-sm">
                    {categoryItems.length} article(s)
                    {isParentCategory && (
                      <span className="ml-1 text-purple-400">
                        (inclut {subcats.length} sous-catégorie{subcats.length > 1 ? "s" : ""}: {subcats.map(s => s.name).join(", ")})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={openAddArticlesModal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter des articles
                </Button>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCategoryItems([]);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {loadingItems ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-xl animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-700 rounded-lg" />
                        <div className="flex-1">
                          <div className="w-3/4 h-5 bg-slate-700 rounded mb-2" />
                          <div className="w-1/2 h-4 bg-slate-700 rounded mb-2" />
                          <div className="w-1/4 h-4 bg-slate-700 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : categoryItems.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Aucun article dans cette catégorie</p>
                  <p className="text-slate-500 text-sm mt-2">Cliquez sur "Ajouter des articles" pour en associer</p>
                  <Button
                    onClick={openAddArticlesModal}
                    className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter des articles
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryItems.map((item) => {
                    const primaryPhoto = item.photos?.find((p) => p.is_primary) || item.photos?.[0];
                    // Check if item is from a subcategory
                    const itemCategoryName = categories.find((c) => c.id === item.category_id)?.name;
                    const isFromSubcategory = item.category_id !== selectedCategory.id;
                    
                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-colors border border-slate-700/50 relative group"
                      >
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openMoveModal(item)}
                            className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
                            title="Déplacer vers une autre catégorie"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCategory(item)}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                            title="Retirer de cette catégorie"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-xl bg-slate-700 flex-shrink-0 overflow-hidden">
                            {primaryPhoto ? (
                              <img src={primaryPhoto.url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 font-semibold truncate">{item.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mt-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-green-400 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>{item.price_desired} €</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isFromSubcategory && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                    {itemCategoryName}
                                  </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-900/50">
              <span className="text-slate-400 text-sm">{categoryItems.length} article(s) affiché(s)</span>
              <a
                href="/admin/items"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                Gérer les articles
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Add Articles Modal */}
      {showAddArticles && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter des articles</h2>
                <p className="text-slate-400 text-sm">
                  Sélectionnez les articles à ajouter à "{selectedCategory.name}"
                </p>
              </div>
              <button
                onClick={() => setShowAddArticles(false)}
                className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Rechercher des articles..."
                  value={searchArticles}
                  onChange={(e) => setSearchArticles(e.target.value)}
                  className="h-12 pl-12 bg-slate-900/50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500"
                />
              </div>
              {selectedItemIds.size > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    {selectedItemIds.size} article(s) sélectionné(s)
                  </span>
                  <button
                    onClick={() => setSelectedItemIds(new Set())}
                    className="text-gray-600 hover:text-gray-900 text-sm underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-280px)]">
              {filteredAvailableItems.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Aucun article disponible</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Tous les articles sont déjà dans cette catégorie ou aucun article n'existe
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAvailableItems.map((item) => {
                    const isSelected = selectedItemIds.has(item.id);
                    const primaryPhoto = item.photos?.find((p) => p.is_primary) || item.photos?.[0];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected
                            ? "bg-green-500/10 border-green-500"
                            : "bg-slate-900/50 border-slate-700/50 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                              isSelected
                                ? "bg-green-500 border-green-500"
                                : "border-slate-600"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>

                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
                            {primaryPhoto ? (
                              <img src={primaryPhoto.url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-500" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 font-medium truncate">{item.name}</h3>
                            <p className="text-slate-400 text-sm truncate">{item.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-green-400 font-medium">{item.price_desired} €</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-900/50">
              <Button
                variant="outline"
                onClick={() => setShowAddArticles(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddArticlesToCategory}
                disabled={selectedItemIds.size === 0 || savingArticles}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {savingArticles ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Ajouter {selectedItemIds.size > 0 ? `(${selectedItemIds.size})` : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Move Article Modal */}
      {showMoveModal && itemToMove && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">Déplacer l'article</h2>
                <p className="text-slate-400 text-sm mt-1">"{itemToMove.name}"</p>
              </div>
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setItemToMove(null);
                }}
                className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Sélectionnez la nouvelle catégorie
              </label>
              <select
                value={targetCategoryId || ""}
                onChange={(e) => setTargetCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Choisir une catégorie --</option>
                {categories
                  .filter((c) => c.id !== selectedCategory?.id) // Exclude current category
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent_id ? "↳ " : ""}{cat.name}
                      {cat.is_default ? " (Par défaut)" : ""}
                    </option>
                  ))}
              </select>

              {targetCategoryId && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-sm">
                    <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                    L'article sera déplacé de "{selectedCategory?.name}" vers "
                    {categories.find((c) => c.id === targetCategoryId)?.name}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveModal(false);
                  setItemToMove(null);
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleMoveToCategory}
                disabled={!targetCategoryId || movingItem}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {movingItem ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Déplacement...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Déplacer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
