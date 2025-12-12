"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  X,
  User,
  Package,
  MapPin,
  Calendar,
  Euro,
  Check,
  Clock,
  Truck,
  CreditCard,
  AlertCircle,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: number;
  item_id: number;
  qty: number;
  unit_price: string;
  item?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  buyer_id: number;
  seller_id: number;
  total_amount: string;
  currency: string;
  status: string;
  billing_address_line: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
  shipping_address_line: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  items: OrderItem[];
  buyer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  seller?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
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
  price_desired: number;
}

const ORDER_STATUSES = [
  { value: "draft", label: "Brouillon", color: "bg-slate-500/20 text-gray-600", icon: Clock },
  { value: "pending_payment", label: "En attente paiement", color: "bg-amber-500/20 text-amber-400", icon: CreditCard },
  { value: "paid_escrow", label: "Payé", color: "bg-blue-500/20 text-blue-400", icon: CreditCard },
  { value: "pickup_scheduled", label: "Retrait programmé", color: "bg-purple-500/20 text-purple-400", icon: Calendar },
  { value: "in_transit", label: "En transit", color: "bg-indigo-500/20 text-indigo-400", icon: Truck },
  { value: "delivered", label: "Livré", color: "bg-cyan-500/20 text-cyan-400", icon: Package },
  { value: "awaiting_signature", label: "En attente signature", color: "bg-orange-500/20 text-orange-400", icon: Edit },
  { value: "completed", label: "Terminée", color: "bg-green-500/20 text-green-400", icon: Check },
  { value: "refunded", label: "Remboursée", color: "bg-pink-500/20 text-pink-400", icon: Euro },
  { value: "cancelled", label: "Annulée", color: "bg-red-500/20 text-red-400", icon: X },
];

// Autocomplete component for user search (buyer/seller)
function UserAutocomplete({
  users,
  selectedUserId,
  onSelect,
  placeholder,
  IconComponent = User,
  accentColor = "blue",
}: {
  users: UserType[];
  selectedUserId: number | null;
  onSelect: (user: UserType) => void;
  placeholder: string;
  IconComponent?: React.ElementType;
  accentColor?: "blue" | "purple";
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search)
    );
  });

  const handleSelect = (user: UserType) => {
    onSelect(user);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredUsers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredUsers[highlightedIndex]) {
      e.preventDefault();
      handleSelect(filteredUsers[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const colorClasses = {
    blue: {
      icon: "text-blue-400",
      focus: "focus:border-blue-500",
      selected: "bg-blue-500/20",
      avatar: "bg-blue-500/20",
    },
    purple: {
      icon: "text-purple-400",
      focus: "focus:border-purple-500",
      selected: "bg-purple-500/20",
      avatar: "bg-purple-500/20",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div className="relative">
      <div className="relative">
        <IconComponent className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.icon}`} />
        <input
          type="text"
          value={searchTerm || (selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedUser) setSearchTerm("");
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 ${colors.focus} focus:outline-none`}
        />
      </div>

      {isOpen && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(user);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100/50 transition-colors ${
                index === highlightedIndex ? "bg-gray-100/50" : ""
              } ${selectedUserId === user.id ? colors.selected : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${colors.icon}`}>
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredUsers.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center text-gray-600">
          Aucun utilisateur trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
}

// Autocomplete component for item search
function ItemAutocomplete({
  items,
  selectedItemId,
  onSelect,
}: {
  items: Item[];
  selectedItemId: number | null;
  onSelect: (item: Item) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: Item) => {
    onSelect(item);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredItems[highlightedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchTerm || (selectedItem ? `${selectedItem.name} - ${selectedItem.price_desired}€` : "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedItem) setSearchTerm("");
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un article..."
          className="w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100/50 transition-colors ${
                index === highlightedIndex ? "bg-gray-100/50" : ""
              } ${selectedItemId === item.id ? "bg-green-500/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">{item.name}</span>
              </div>
              <span className="text-green-600 font-medium">{item.price_desired}€</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center text-gray-600">
          Aucun article trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    buyer_id: "",
    seller_id: "",
    status: "draft",
    billing_address_line: "",
    billing_city: "",
    billing_postal_code: "",
    billing_country: "France",
    shipping_address_line: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "France",
    items: [] as { item_id: number; qty: number; item?: Item }[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes, itemsRes] = await Promise.all([
        fetch('/api/orders', { credentials: "include" }),
        fetch('/api/users', { credentials: "include" }),
        fetch('/api/items', { credentials: "include" }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (itemsRes.ok) setItems(await itemsRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setForm({
      buyer_id: "",
      seller_id: "",
      status: "draft",
      billing_address_line: "",
      billing_city: "",
      billing_postal_code: "",
      billing_country: "France",
      shipping_address_line: "",
      shipping_city: "",
      shipping_postal_code: "",
      shipping_country: "France",
      items: [],
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setForm({
      buyer_id: order.buyer_id.toString(),
      seller_id: order.seller_id.toString(),
      status: order.status,
      billing_address_line: order.billing_address_line || "",
      billing_city: order.billing_city || "",
      billing_postal_code: order.billing_postal_code || "",
      billing_country: order.billing_country || "France",
      shipping_address_line: order.shipping_address_line || "",
      shipping_city: order.shipping_city || "",
      shipping_postal_code: order.shipping_postal_code || "",
      shipping_country: order.shipping_country || "France",
      items: order.items?.map((i) => ({
        item_id: i.item_id,
        qty: i.qty,
        item: items.find((item) => item.id === i.item_id),
      })) || [],
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const isEdit = !!editingOrder;

      const body: any = {
        buyer_id: parseInt(form.buyer_id),
        seller_id: parseInt(form.seller_id),
        billing_address_line: form.billing_address_line,
        billing_city: form.billing_city,
        billing_postal_code: form.billing_postal_code,
        billing_country: form.billing_country,
        shipping_address_line: form.shipping_address_line,
        shipping_city: form.shipping_city,
        shipping_postal_code: form.shipping_postal_code,
        shipping_country: form.shipping_country,
      };

      if (!isEdit) {
        body.items = form.items.map((i) => ({ item_id: i.item_id, qty: i.qty }));
      }

      const url = isEdit
        ? `/api/orders/${editingOrder.id}`
        : `/api/orders`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Échec de l'enregistrement");
      }

      // Update status if editing
      if (isEdit && form.status !== editingOrder.status) {
        await fetch(`/api/orders/${editingOrder.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: form.status }),
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const addItemToOrder = () => {
    setForm({
      ...form,
      items: [...form.items, { item_id: 0, qty: 1, item: undefined }],
    });
  };

  const removeItemFromOrder = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateOrderItem = (index: number, item: Item) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], item_id: item.id, item };
    setForm({ ...form, items: newItems });
  };

  const updateOrderItemQty = (index: number, qty: number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], qty };
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, orderItem) => {
      const item = orderItem.item || items.find((i) => i.id === orderItem.item_id);
      if (item) {
        return sum + Number(item.price_desired) * orderItem.qty;
      }
      return sum;
    }, 0);
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      order.buyer?.first_name?.toLowerCase().includes(searchLower) ||
      order.buyer?.last_name?.toLowerCase().includes(searchLower) ||
      order.seller?.first_name?.toLowerCase().includes(searchLower) ||
      order.seller?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
  };

  const getUserName = (user?: { first_name: string; last_name: string }) => {
    if (!user) return "-";
    return `${user.first_name} ${user.last_name}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            Gestion des Commandes
          </h1>
          <p className="text-gray-600 mt-1">{orders.length} commandes</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Commande
          </Button>
          <Button
            onClick={fetchData}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Rechercher par ID ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">ID</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Acheteur</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Vendeur</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Total</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Statut</th>
                  <th className="text-left px-6 py-4 text-gray-600 font-medium">Date</th>
                  <th className="text-right px-6 py-4 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-100/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-mono">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-900">{getUserName(order.buyer)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-900">{getUserName(order.seller)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-semibold">
                          {order.total_amount} {order.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(order)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Sidebar */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Commande #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-600 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Statut</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-green-500 focus:outline-none"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buyer & Seller */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-gray-600 text-xs mb-1">Acheteur</p>
                <p className="text-gray-900 font-medium">{getUserName(selectedOrder.buyer)}</p>
                <p className="text-gray-600 text-sm">{selectedOrder.buyer?.email}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-gray-600 text-xs mb-1">Vendeur</p>
                <p className="text-gray-900 font-medium">{getUserName(selectedOrder.seller)}</p>
                <p className="text-gray-600 text-sm">{selectedOrder.seller?.email}</p>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-6">
              <p className="text-green-400 text-sm mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">
                {selectedOrder.total_amount} <span className="text-lg">{selectedOrder.currency}</span>
              </p>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Articles ({selectedOrder.items?.length || 0})</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-gray-900">{item.item?.name || `Article #${item.item_id}`}</p>
                      <p className="text-gray-600 text-sm">Qté: {item.qty}</p>
                    </div>
                    <p className="text-green-600 font-medium">{item.unit_price} €</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse de facturation
                </h3>
                <p className="text-gray-900 text-sm">
                  {selectedOrder.billing_address_line || "-"}
                  <br />
                  {selectedOrder.billing_postal_code} {selectedOrder.billing_city}
                  <br />
                  {selectedOrder.billing_country}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Adresse de livraison
                </h3>
                <p className="text-gray-900 text-sm">
                  {selectedOrder.shipping_address_line || "-"}
                  <br />
                  {selectedOrder.shipping_postal_code} {selectedOrder.shipping_city}
                  <br />
                  {selectedOrder.shipping_country}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => openEditModal(selectedOrder)}
                className="flex-1 bg-gray-100 hover:bg-gray-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                onClick={() => handleDelete(selectedOrder.id)}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOrder ? "Modifier la Commande" : "Nouvelle Commande"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* Buyer & Seller with Autocomplete */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Acheteur</label>
                  <UserAutocomplete
                    users={users}
                    selectedUserId={form.buyer_id ? parseInt(form.buyer_id) : null}
                    onSelect={(user) => setForm({ ...form, buyer_id: user.id.toString() })}
                    placeholder="Rechercher un acheteur..."
                    IconComponent={User}
                    accentColor="blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendeur</label>
                  <UserAutocomplete
                    users={users}
                    selectedUserId={form.seller_id ? parseInt(form.seller_id) : null}
                    onSelect={(user) => setForm({ ...form, seller_id: user.id.toString() })}
                    placeholder="Rechercher un vendeur..."
                    IconComponent={Store}
                    accentColor="purple"
                  />
                </div>
              </div>

              {/* Status (only for edit) */}
              {editingOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-green-500 focus:outline-none"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Items (only for create) */}
              {!editingOrder && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Articles
                      {form.items.length > 0 && (
                        <span className="ml-2 text-green-400">
                          (Total: {calculateTotal().toFixed(2)}€)
                        </span>
                      )}
                    </label>
                    <Button onClick={addItemToOrder} size="sm" variant="outline" className="bg-gray-100 border-gray-300">
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((orderItem, index) => (
                      <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
                        <ItemAutocomplete
                          items={items}
                          selectedItemId={orderItem.item_id || null}
                          onSelect={(item) => updateOrderItem(index, item)}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-sm">Qté:</span>
                          <Input
                            type="number"
                            min="1"
                            value={orderItem.qty}
                            onChange={(e) => updateOrderItemQty(index, parseInt(e.target.value) || 1)}
                            className="w-20 bg-white border-gray-300 text-gray-900 text-center"
                          />
                        </div>
                        {orderItem.item && (
                          <span className="text-green-400 font-medium whitespace-nowrap">
                            = {(Number(orderItem.item.price_desired) * orderItem.qty).toFixed(2)}€
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromOrder(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {form.items.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                        <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Aucun article. Cliquez sur "Ajouter" pour en ajouter.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Billing Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Adresse de facturation
                </h3>
                <div className="space-y-3">
                  <Input
                    value={form.billing_address_line}
                    onChange={(e) => setForm({ ...form, billing_address_line: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Rue"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      value={form.billing_city}
                      onChange={(e) => setForm({ ...form, billing_city: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Ville"
                    />
                    <Input
                      value={form.billing_postal_code}
                      onChange={(e) => setForm({ ...form, billing_postal_code: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Code postal"
                    />
                    <Input
                      value={form.billing_country}
                      onChange={(e) => setForm({ ...form, billing_country: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Pays"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Adresse de livraison
                </h3>
                <div className="space-y-3">
                  <Input
                    value={form.shipping_address_line}
                    onChange={(e) => setForm({ ...form, shipping_address_line: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Rue"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      value={form.shipping_city}
                      onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Ville"
                    />
                    <Input
                      value={form.shipping_postal_code}
                      onChange={(e) => setForm({ ...form, shipping_postal_code: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Code postal"
                    />
                    <Input
                      value={form.shipping_country}
                      onChange={(e) => setForm({ ...form, shipping_country: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="Pays"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || (!editingOrder && form.items.length === 0)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {saving ? "Enregistrement..." : editingOrder ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
