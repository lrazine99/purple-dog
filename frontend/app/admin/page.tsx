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
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers });
      const users = usersRes.ok ? await usersRes.json() : [];

      // Fetch items
      const itemsRes = await fetch("http://localhost:3001/items", { headers });
      const items = itemsRes.ok ? await itemsRes.json() : [];

      // Fetch categories
      const categoriesRes = await fetch("http://localhost:3001/categories", { headers });
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];

      setStats({
        totalUsers: users.length,
        verifiedUsers: users.filter((u: any) => u.is_verified).length,
        totalItems: items.length,
        totalCategories: categories.length,
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
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="text-slate-400 mt-1">Bienvenue sur le panneau d'administration Purple Dog</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-slate-700 rounded animate-pulse" />
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
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-4 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Gérer les Utilisateurs</p>
              <p className="text-slate-400 text-sm">Voir et modifier les utilisateurs</p>
            </div>
          </a>
          <a
            href="/admin/items"
            className="flex items-center gap-4 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Gérer les Articles</p>
              <p className="text-slate-400 text-sm">Voir et modifier les articles</p>
            </div>
          </a>
          <a
            href="/admin/categories"
            className="flex items-center gap-4 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderTree className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium">Gérer les Catégories</p>
              <p className="text-slate-400 text-sm">Voir et modifier les catégories</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Informations Système</h2>
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">Statut API</span>
            <span className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              En ligne
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">Base de données</span>
            <span className="text-green-400">Connectée</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-400">Version</span>
            <span className="text-slate-300">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
