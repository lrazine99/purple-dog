"use client";

import { Badge } from "@/components/ui/badge";
import {
  formatAmountForDisplay,
  getPaymentMethodDisplay,
  getPaymentStatusDisplay,
} from "@/lib/utils/payment-helpers";
import { StripePaymentIntent } from "@/lib/type/payment.type";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface PaymentsViewProps {
  data: StripePaymentIntent[];
  isLoading?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "succeeded":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "requires_payment_method":
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "requires_action":
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    default:
      return null;
  }
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PaymentsView({ data, isLoading }: PaymentsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Chargement des paiements...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Montant
              </th>
              <th scope="col" className="px-6 py-3">
                Méthode de paiement
              </th>
              <th scope="col" className="px-6 py-3">
                Statut
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => {
                const statusDisplay = getPaymentStatusDisplay(item.status);
                const paymentMethod = item.payment_method
                  ? getPaymentMethodDisplay(item.payment_method)
                  : "Non spécifié";

                return (
                  <tr
                    key={`payment-item-${index}`}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {item.description || "Paiement"}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatAmountForDisplay(item.amount, item.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-bold uppercase">
                        {paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge
                          variant={
                            statusDisplay.color === "success"
                              ? "default"
                              : statusDisplay.color === "destructive"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {statusDisplay.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(item.created)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="text-muted-foreground py-8 text-center"
                  colSpan={5}
                >
                  Aucun paiement
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

