# Module de Paiement Stripe

Ce module implémente un système de paiement sécurisé avec Stripe, avec traçabilité complète dans la base de données.

## Architecture

Le système de paiement suit les principes SOLID :
- **Single Responsibility** : Chaque classe a une responsabilité unique
- **Open/Closed** : Extensible sans modification
- **Dependency Inversion** : Dépend des abstractions (interfaces)

## Configuration

### Variables d'environnement requises

```env
STRIPE_SECRET_KEY=sk_test_...  # Clé secrète Stripe (test ou production)
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret du webhook Stripe (optionnel en dev)
FRONTEND_URL=http://localhost:3000  # URL du frontend pour les redirections
STRIPE_ALLOW_LOCAL_TEST=true  # Mettre à false en production
```

## Flux de paiement

1. **Création de la commande** : L'utilisateur crée une commande (`Order`)
2. **Création du paiement** : Appel à `POST /payments` avec `order_id`
3. **Redirection Stripe** : L'utilisateur est redirigé vers Stripe Checkout
4. **Vérification** : Après paiement, redirection vers `/paiements/verification`
5. **Webhook** : Stripe envoie un webhook pour confirmer (optionnel)

## Endpoints API

### POST /payments
Crée une session de checkout Stripe pour une commande.

**Body:**
```json
{
  "order_id": 1,
  "success_url": "http://localhost:3000/paiements/verification",
  "cancel_url": "http://localhost:3000/paiements?canceled=true"
}
```

**Response:**
```json
{
  "id": 1,
  "order_id": 1,
  "checkout_url": "https://checkout.stripe.com/...",
  "status": "pending",
  "amount": "299.99",
  "currency": "EUR"
}
```

### POST /payments/verify
Vérifie un paiement après redirection depuis Stripe.

**Body:**
```json
{
  "checkout_session_id": "cs_test_..."
}
```

**Response:**
```json
{
  "verified": true,
  "payment": { ... }
}
```

### GET /payments
Récupère tous les paiements de l'utilisateur authentifié.

### GET /payments/:id
Récupère un paiement par ID.

### GET /payments/order/:orderId
Récupère le paiement associé à une commande.

### POST /payments/webhook
Endpoint pour les webhooks Stripe (pas d'authentification requise).

## Sécurité

- ✅ Toutes les clés secrètes restent côté serveur
- ✅ Vérification de signature des webhooks
- ✅ Validation des données avec DTOs
- ✅ Vérification de propriété (un utilisateur ne peut payer que ses commandes)
- ✅ Protection contre les doubles paiements (`is_used` flag)

## Base de données

Le module crée une table `payments` avec :
- Lien vers la commande (`order_id`)
- Lien vers l'utilisateur (`user_id`)
- IDs Stripe (payment_intent, checkout_session, customer)
- Statut du paiement
- Flag `is_used` pour éviter les doubles traitements

## Tests

Pour tester sans webhook :
1. Créer une commande
2. Appeler `POST /payments` avec `order_id`
3. Utiliser l'URL `checkout_url` pour tester
4. Utiliser les cartes de test Stripe : `4242 4242 4242 4242`
5. Après paiement, appeler `POST /payments/verify` avec le `checkout_session_id`

## Migration de base de données

Le module utilise TypeORM avec `synchronize: true` en développement.
En production, créez une migration :

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

