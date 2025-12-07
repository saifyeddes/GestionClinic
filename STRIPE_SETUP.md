# Configuration Stripe pour le Paiement

## 1. Obtenir vos clés Stripe

Pour tester le paiement Stripe, vous devez créer un compte Stripe et récupérer vos clés de test.

### Étapes :
1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Créez un compte si vous n'en avez pas
3. Allez à **Developers** → **API Keys** (dans le menu de gauche)
4. Vous verrez deux clés en mode **Test** :
   - **Publishable Key** (commence par `pk_test_`)
   - **Secret Key** (commence par `sk_test_`)

## 2. Mettre à jour le fichier `.env`

Ouvrez `backend/.env` et remplacez les valeurs de test par vos vraies clés :

```env
# Remplacez ces valeurs par vos vraies clés Stripe
STRIPE_SECRET_KEY=sk_test_VOTRE_CLÉ_SECRÈTE_ICI
STRIPE_WEBHOOK_SECRET=whsec_test_VOTRE_CLÉ_WEBHOOK_ICI
FRONTEND_URL=http://localhost:3000
```

## 3. Carte de test Stripe

Pour tester les paiements, utilisez ces numéros de carte de test :

**Paiement réussi :**
- Numéro : `4242 4242 4242 4242`
- Date d'expiration : `12/25` (ou toute date future)
- CVV : `123`

**Paiement rejeté :**
- Numéro : `4000 0000 0000 0002`

## 4. Webhook local (optionnel)

Pour tester les webhooks localement, utilisez **Stripe CLI** :

```bash
# Installer Stripe CLI (https://stripe.com/docs/stripe-cli)
stripe login
stripe listen --forward-to localhost:4000/appointments/stripe/webhook
```

Ensuite, récupérez la clé webhook affichée et mettez-la à jour dans `.env` :
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

## 5. Redémarrer le serveur

Après avoir mis à jour le `.env`, redémarrez le serveur backend :

```bash
cd backend
npm run start:dev
```

## 6. Tester le paiement

1. Créez un rendez-vous en tant que patient
2. Cliquez sur "Payer XXX DT" 
3. Choisissez "Payer en ligne"
4. Confirmez la redirection vers Stripe
5. Utilisez une carte de test pour tester

---

**Important :** Ne commitez jamais vos vraies clés Stripe dans Git ! Le `.env` doit être dans `.gitignore`.
