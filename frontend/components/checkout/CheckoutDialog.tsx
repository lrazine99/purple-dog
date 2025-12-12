"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/lib/api/order.service";
import { paymentService } from "@/lib/api/payment.service";
import { useToast } from "@/hooks/useToast";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  sellerId: number;
  price: number;
  itemName: string;
}

type AddressType = {
  line: string;
  city: string;
  postal_code: string;
  country: string;
  complement?: string;
};

const ADDRESS_OPTION_SAVED = "saved";
const ADDRESS_OPTION_NEW = "new";

export function CheckoutDialog({
  open,
  onOpenChange,
  itemId,
  sellerId,
  price,
  itemName,
}: CheckoutDialogProps) {
  const { data: user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize addresses from user data
  const userAddress: AddressType | null = user
    ? {
        line: user.address_line || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
        country: user.country || "France",
        complement: "",
      }
    : null;

  // Billing address selection and form
  const [billingAddressOption, setBillingAddressOption] = useState<string>(
    userAddress ? ADDRESS_OPTION_SAVED : ADDRESS_OPTION_NEW
  );
  const [billingAddress, setBillingAddress] = useState<AddressType>({
    line: "",
    city: "",
    postal_code: "",
    country: "France",
    complement: "",
  });

  // Shipping address selection and form
  const [shippingAddressOption, setShippingAddressOption] = useState<string>(
    userAddress ? ADDRESS_OPTION_SAVED : ADDRESS_OPTION_NEW
  );
  const [shippingAddress, setShippingAddress] = useState<AddressType>({
    line: "",
    city: "",
    postal_code: "",
    country: "France",
    complement: "",
  });

  const [useSameAddress, setUseSameAddress] = useState(true);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "error",
        message: "Vous devez être connecté pour acheter",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Determine final addresses based on selection
      let finalBillingAddress: AddressType;
      let finalShippingAddress: AddressType;

      // Billing address
      if (billingAddressOption === ADDRESS_OPTION_SAVED && userAddress) {
        finalBillingAddress = userAddress;
      } else {
        finalBillingAddress = billingAddress;
      }

      // Shipping address
      if (useSameAddress) {
        finalShippingAddress = finalBillingAddress;
      } else if (shippingAddressOption === ADDRESS_OPTION_SAVED && userAddress) {
        finalShippingAddress = userAddress;
      } else {
        finalShippingAddress = shippingAddress;
      }

      // Validate required fields
      if (
        !finalBillingAddress.line ||
        !finalBillingAddress.city ||
        !finalBillingAddress.postal_code
      ) {
        toast({
          variant: "error",
          message: "Veuillez remplir tous les champs de l'adresse de facturation",
        });
        setIsProcessing(false);
        return;
      }

      if (
        !finalShippingAddress.line ||
        !finalShippingAddress.city ||
        !finalShippingAddress.postal_code
      ) {
        toast({
          variant: "error",
          message: "Veuillez remplir tous les champs de l'adresse de livraison",
        });
        setIsProcessing(false);
        return;
      }

      // Create order
      const order = await orderService.createOrder({
        buyer_id: user.id,
        seller_id: sellerId,
        items: [{ item_id: itemId, qty: 1 }],
        billing_address_line: finalBillingAddress.line,
        billing_city: finalBillingAddress.city,
        billing_postal_code: finalBillingAddress.postal_code,
        billing_country: finalBillingAddress.country,
        billing_address_complement: finalBillingAddress.complement || undefined,
        shipping_address_line: finalShippingAddress.line,
        shipping_city: finalShippingAddress.city,
        shipping_postal_code: finalShippingAddress.postal_code,
        shipping_country: finalShippingAddress.country,
        shipping_address_complement: finalShippingAddress.complement || undefined,
      });

      // Create payment and get checkout URL
      // Le choix du mode de paiement se fera sur la page Stripe
      const payment = await paymentService.createPayment({
        order_id: order.id,
        payment_method_type: 'both', // Stripe affichera les deux options
      });

      if (payment.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = payment.checkout_url;
      } else {
        throw new Error("URL de paiement non disponible");
      }
    } catch (error) {
      console.error("Erreur lors du checkout:", error);
      toast({
        variant: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors du traitement de la commande",
      });
      setIsProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">Chargement en cours</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>
              Vous devez être connecté pour effectuer un achat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finaliser votre achat</DialogTitle>
          <DialogDescription>
            {itemName} - {price.toLocaleString("fr-FR")} €
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Billing Address Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Adresse de facturation
              </Label>
            </div>

            <Select
              value={billingAddressOption}
              onChange={(e) => setBillingAddressOption(e.target.value)}
            >
              {userAddress && (
                <option value={ADDRESS_OPTION_SAVED}>
                  Utiliser mon adresse enregistrée
                </option>
              )}
              <option value={ADDRESS_OPTION_NEW}>
                Ajouter une nouvelle adresse
              </option>
            </Select>

            {billingAddressOption === ADDRESS_OPTION_SAVED && userAddress && (
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-sm font-medium">{userAddress.line}</p>
                <p className="text-sm text-muted-foreground">
                  {userAddress.postal_code} {userAddress.city}, {userAddress.country}
                </p>
              </div>
            )}

            {billingAddressOption === ADDRESS_OPTION_NEW && (
              <div className="space-y-4 p-4 border rounded-md">
                <div>
                  <Label htmlFor="billing_line">Adresse</Label>
                  <Input
                    id="billing_line"
                    value={billingAddress.line}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        line: e.target.value,
                      })
                    }
                    placeholder="123 Rue Example"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billing_complement">
                    Complément d'adresse (facultatif)
                  </Label>
                  <Input
                    id="billing_complement"
                    value={billingAddress.complement || ""}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        complement: e.target.value,
                      })
                    }
                    placeholder="Appartement, étage, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billing_city">Ville</Label>
                    <Input
                      id="billing_city"
                      value={billingAddress.city}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          city: e.target.value,
                        })
                      }
                      placeholder="Paris"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_postal">Code postal</Label>
                    <Input
                      id="billing_postal"
                      value={billingAddress.postal_code}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          postal_code: e.target.value,
                        })
                      }
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billing_country">Pays</Label>
                  <Input
                    id="billing_country"
                    value={billingAddress.country}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        country: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Shipping Address Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Adresse de livraison
              </Label>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="use_same_address"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label
                htmlFor="use_same_address"
                className="text-sm font-normal cursor-pointer"
              >
                Utiliser la même adresse que la facturation
              </Label>
            </div>

            {!useSameAddress && (
              <>
                <Select
                  value={shippingAddressOption}
                  onChange={(e) => setShippingAddressOption(e.target.value)}
                >
                  {userAddress && (
                    <option value={ADDRESS_OPTION_SAVED}>
                      Utiliser mon adresse enregistrée
                    </option>
                  )}
                  <option value={ADDRESS_OPTION_NEW}>
                    Ajouter une nouvelle adresse
                  </option>
                </Select>

                {shippingAddressOption === ADDRESS_OPTION_SAVED &&
                  userAddress && (
                    <div className="p-4 border rounded-md bg-muted/30">
                      <p className="text-sm font-medium">{userAddress.line}</p>
                      <p className="text-sm text-muted-foreground">
                        {userAddress.postal_code} {userAddress.city},{" "}
                        {userAddress.country}
                      </p>
                    </div>
                  )}

                {shippingAddressOption === ADDRESS_OPTION_NEW && (
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="shipping_line">Adresse</Label>
                      <Input
                        id="shipping_line"
                        value={shippingAddress.line}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            line: e.target.value,
                          })
                        }
                        placeholder="123 Rue Example"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping_complement">
                        Complément d'adresse (facultatif)
                      </Label>
                      <Input
                        id="shipping_complement"
                        value={shippingAddress.complement || ""}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            complement: e.target.value,
                          })
                        }
                        placeholder="Appartement, étage, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping_city">Ville</Label>
                        <Input
                          id="shipping_city"
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              city: e.target.value,
                            })
                          }
                          placeholder="Paris"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_postal">Code postal</Label>
                        <Input
                          id="shipping_postal"
                          value={shippingAddress.postal_code}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              postal_code: e.target.value,
                            })
                          }
                          placeholder="75001"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shipping_country">Pays</Label>
                      <Input
                        id="shipping_country"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            country: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {useSameAddress && (
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  L'adresse de livraison sera identique à l'adresse de
                  facturation
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">
                {price.toLocaleString("fr-FR")} €
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Le paiement sera traité de manière sécurisée via Stripe
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              "Procéder au paiement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
