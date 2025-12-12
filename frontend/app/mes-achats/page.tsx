"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Package,
  MapPin,
  Euro,
  Check,
  Clock,
  Truck,
  CreditCard,
  Store,
  Calendar,
  Edit,
  X,
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
  seller?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
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

export default function MesAchatsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/my-orders", { credentials: "include" });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      order.seller?.first_name?.toLowerCase().includes(searchLower) ||
      order.seller?.last_name?.toLowerCase().includes(searchLower) ||
      order.items?.some(item => item.item?.name?.toLowerCase().includes(searchLower))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              Mes Achats
            </h1>
            <p className="text-gray-600 mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par ID, vendeur ou article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun achat trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-900 font-mono font-semibold">#{order.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <Store className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600">Vendeur</p>
                      <p className="text-gray-900 font-medium">{getUserName(order.seller)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Articles ({order.items?.length || 0})</p>
                    <div className="space-y-1">
                      {order.items?.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 truncate">{item.item?.name || `Article #${item.item_id}`}</span>
                          <span className="text-gray-600">×{item.qty}</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-gray-500">+{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Total</span>
                    <span className="text-blue-600 font-bold text-lg">
                      {order.total_amount} {order.currency}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mt-3">{formatDate(order.created_at)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Sidebar */}
        {selectedOrder && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Commande #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-600 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status */}
              <div className="mb-6">
                {(() => {
                  const statusInfo = getStatusInfo(selectedOrder.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`p-4 rounded-xl ${statusInfo.color} flex items-center gap-3`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-medium">{statusInfo.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Seller */}
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl mb-6">
                <p className="text-gray-600 text-xs mb-1">Vendeur</p>
                <p className="text-gray-900 font-medium">{getUserName(selectedOrder.seller)}</p>
                <p className="text-gray-600 text-sm">{selectedOrder.seller?.email}</p>
              </div>

              {/* Total */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
                <p className="text-blue-600 text-sm mb-1">Total</p>
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
                      <p className="text-blue-600 font-medium">{item.unit_price} €</p>
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

              {/* Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">Créée le {formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
