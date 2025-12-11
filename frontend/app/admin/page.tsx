"use client";

import { useEffect, useState } from "react";
import { Users, Package, FolderTree, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  totalItems: number;
  totalCategories: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalItems: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Utiliser les API routes avec cookies
      // Fetch users
      const usersRes = await fetch('/api/users', {
        credentials: "include",
      });
      const users = usersRes.ok ? await usersRes.json() : [];

      // Fetch items
      const itemsRes = await fetch('/api/items', {
        credentials: "include",
      });
      const items = itemsRes.ok ? await itemsRes.json() : [];

      // Fetch categories
      const categoriesRes = await fetch('/api/categories', {
        credentials: "include",
      });
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        verifiedUsers: Array.isArray(users) ? users.filter((u: any) => u.is_verified).length : 0,
        totalItems: Array.isArray(items) ? items.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/25",
    },
    {
      title: "Utilisateurs Vérifiés",
      value: stats.verifiedUsers,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
      shadow: "shadow-green-500/25",
    },
    {
      title: "Total Articles",
      value: stats.totalItems,
      icon: Package,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/25",
    },
    {
      title: "Catégories",
      value: stats.totalCategories,
      icon: FolderTree,
      gradient: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-500/25",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Bienvenue sur le panneau d'administration Purple Dog</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div
                className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg ${card.shadow}`}
              >
                <card.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group border border-blue-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Gérer les Utilisateurs</p>
              <p className="text-gray-600 text-sm">Voir et modifier les utilisateurs</p>
            </div>
          </a>
          <a
            href="/admin/items"
            className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 group border border-purple-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Gérer les Articles</p>
              <p className="text-gray-600 text-sm">Voir et modifier les articles</p>
            </div>
          </a>
          <a
            href="/admin/categories"
            className="flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200 group border border-orange-100"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderTree className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Gérer les Catégories</p>
              <p className="text-gray-600 text-sm">Voir et modifier les catégories</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Informations Système</h2>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Statut API</span>
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En ligne
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Base de données</span>
            <span className="text-green-600 font-medium">Connectée</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Version</span>
            <span className="text-gray-900 font-medium">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
