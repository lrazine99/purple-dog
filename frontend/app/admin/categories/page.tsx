"use client";

import { useEffect, useState } from "react";
import { FolderTree, Search, RefreshCw, Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface CategoryTree extends Category {
  children: CategoryTree[];
  expanded?: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("access_token");
      const body: any = { name: newCategory };
      if (selectedParent) {
        body.parent_id = selectedParent;
      }
      
      const res = await fetch("http://localhost:3001/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:3001/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
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

  // Get root categories for parent selector
  const rootCategories = categories.filter((c) => c.parent_id === null);

  const filteredTree = search
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  // Render category item with children
  const renderCategory = (category: CategoryTree, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors ${
            level > 0 ? "border-l-2 border-slate-700 ml-6" : ""
          }`}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                level === 0
                  ? "bg-gradient-to-br from-orange-500 to-amber-500"
                  : "bg-gradient-to-br from-purple-500 to-indigo-500"
              }`}
            >
              <FolderTree className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{category.name}</p>
              <p className="text-slate-400 text-sm">
                ID: {category.id}
                {category.parent_id && ` • Parent: ${category.parent_id}`}
                {hasChildren && ` • ${category.children.length} subcategories`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedParent(category.id);
                document.getElementById("new-category-input")?.focus();
              }}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Sub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-orange-400" />
            Gestion des Catégories
          </h1>
          <p className="text-slate-400 mt-1">{categories.length} catégories</p>
        </div>
        <Button
          onClick={fetchCategories}
          variant="outline"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Add Category */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Ajouter {selectedParent ? "une sous-catégorie" : "une catégorie"}
        </h2>
        
        {selectedParent && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-slate-400 text-sm">Parent :</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              {categories.find((c) => c.id === selectedParent)?.name}
            </span>
            <button
              onClick={() => setSelectedParent(null)}
              className="text-slate-400 hover:text-white text-sm underline"
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
              className="h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
            />
          </div>
          <select
            value={selectedParent || ""}
            onChange={(e) => setSelectedParent(e.target.value ? Number(e.target.value) : null)}
            className="h-12 px-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="">Sans parent (catégorie racine)</option>
            {rootCategories.map((cat) => (
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Rechercher des catégories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
        />
      </div>

      {/* Categories Tree */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl animate-pulse" />
                  <div className="w-40 h-5 bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune catégorie trouvée</p>
          </div>
        ) : search ? (
          // Flat search results
          <div className="divide-y divide-slate-700/50">
            {filteredTree?.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-400">Aucune catégorie correspondante</p>
              </div>
            ) : (
              filteredTree?.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                      <FolderTree className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{category.name}</p>
                      <p className="text-slate-400 text-sm">
                        ID: {category.id}
                        {category.parent_id && ` • Parent: ${category.parent_id}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Tree view
          <div className="divide-y divide-slate-700/50">
            {categoryTree.map((category) => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}
