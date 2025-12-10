# 💳 Module de Paiement Stripe

## 📋 Vue d'ensemble

Le module `PaymentsModule` intègre Stripe Checkout pour un paiement sécurisé directement sur la page de Stripe.

## 🏗️ Architecture

### Services
- **PaymentsService**
  - `createCheckoutSession()`: Crée une session Stripe Checkout
  - `verifyPayment()`: Vérifie et confirme un paiement complété
  - Gère la mise à jour du statut des rendez-vous

### Contrôleurs
- **PaymentsController**
  - `POST /payments/create-checkout-session`: Crée une session
  - `GET /payments/verify-payment`: Vérifie un paiement

## 🔄 Flux de Paiement

1. **Frontend**: Appelle `POST /payments/create-checkout-session`
   ```json
   {
     "appointmentId": "uuid",
     "amount": 50,
     "doctorName": "Dr. Dupont"
   }
   ```

2. **Backend**: Crée une session Stripe
   - Retourne `sessionId` et `url`

3. **Frontend**: Redirige vers `session.url` (page Stripe)

4. **Utilisateur**: Paie sur Stripe

5. **Stripe**: Redirige vers `success_url` avec `sessionId`

6. **Backend**: Vérifie le paiement
   - Met à jour statut à `CONFIRMED`
   - Met à jour paymentStatus à `PAID`

## 🔐 Sécurité

- Clés Stripe en variables d'environnement
- Pas d'exposition de données sensibles
- JWT authentication sur tous les endpoints
- Métadonnées sécurisées pour tracer les paiements

## 📦 Dépendances

- `stripe@^11.18.0`: Client Stripe officiel
- `@nestjs/typeorm`: ORM pour base de données
- JWT Guard: Protection des routes

## 🌐 Configuration

### Variables d'Environnement
```env
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:3000
```

### Redirection Stripe
- Success: `{FRONTEND_URL}/patient?payment=success&appointmentId={id}`
- Cancel: `{FRONTEND_URL}/patient?payment=cancelled`

## 📱 Endpoints

### Créer une session
```bash
POST /payments/create-checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": "uuid",
  "amount": 50,
  "doctorName": "Dr. Dupont"
}

Response:
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Vérifier le paiement
```bash
GET /payments/verify-payment?sessionId=cs_test_...
Authorization: Bearer {token}

Response:
{
  "success": true,
  "status": "paid",
  "appointmentId": "uuid"
}
```

## 🎯 Mise à jour du Rendez-vous

Après confirmation du paiement:
- `status`: `SCHEDULED` → `CONFIRMED`
- `paymentStatus`: `PENDING` → `PAID`

## 📝 Notes d'Implémentation

- Stripe Checkout gère toute la sécurité des paiements
- Aucune donnée bancaire n'est transmise au serveur
- Les sessions expirent après 24h sur Stripe
- Métadonnées permettent de tracker les appointmentId
