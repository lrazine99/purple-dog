# 🔐 Migration vers l'Authentification par Cookies

**Date**: 11 Décembre 2025  
**Branch**: `backoffice`  
**Status**: ✅ Complété

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Pourquoi ce changement ?](#pourquoi-ce-changement-)
- [Fichiers modifiés](#fichiers-modifiés)
- [Changements détaillés](#changements-détaillés)
- [Guide de migration](#guide-de-migration)
- [Impact sur l'équipe](#impact-sur-léquipe)
- [Exemples de code](#exemples-de-code)
- [Tests](#tests)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Cette migration transforme notre système d'authentification de **localStorage** vers des **cookies HTTP-only sécurisés**.

### Avant ❌
```
Frontend → localStorage → Bearer Token → Backend Direct
```

### Maintenant ✅
```
Frontend → API Routes → HTTP-only Cookies → Backend
```

---

## 🤔 Pourquoi ce changement ?

### Problèmes de sécurité avec localStorage

1. **Vulnérabilité XSS** 🚨
   - localStorage est accessible par JavaScript
   - Attaques XSS peuvent voler les tokens
   - Aucune protection contre le code malveillant

2. **Architecture peu optimale** 😕
   - Frontend appelle directement le backend
   - URL backend exposée côté client
   - Pas de couche de protection

### Avantages des cookies HTTP-only

1. **Sécurité renforcée** 🛡️
   - JavaScript ne peut pas accéder aux cookies HTTP-only
   - Protection contre les attaques XSS
   - Gestion automatique par le navigateur

2. **Meilleure architecture** 🏗️
   - API Routes Next.js comme middleware
   - Backend URL cachée (networking Docker)
   - Validation côté serveur

3. **Bonnes pratiques Next.js** ✅
   - Pattern recommandé par Vercel
   - SSR-friendly
   - Compatible avec les Route Handlers

---

## 📦 Fichiers modifiés

### Backend (4 fichiers)

| Fichier | Type | Description |
|---------|------|-------------|
| `backend/package.json` | Modifié | Ajout de `cookie-parser` |
| `backend/src/main.ts` | Modifié | Configuration cookie-parser |
| `backend/src/auth/jwt.strategy.ts` | Modifié | Extraction JWT depuis cookies |
| `docker-compose.dev.yml` | Modifié | Config Docker et networking |

### Frontend (7 fichiers)

| Fichier | Type | Description |
|---------|------|-------------|
| `frontend/app/api/users/route.ts` | **Nouveau** | API GET/POST users |
| `frontend/app/api/users/[id]/route.ts` | **Nouveau** | API PATCH/DELETE users |
| `frontend/app/admin/users/page.tsx` | Modifié | Migration vers cookies |
| `frontend/app/api/auth/login/route.ts` | Modifié | Docker networking |
| `frontend/app/api/auth/me/route.ts` | Modifié | Docker networking |
| `frontend/components/form/LoginForm.tsx` | Modifié | Suppression localStorage |
| `frontend/lib/type/item.type.ts` | Modifié | Nouveaux types |

### Package Locks (2 fichiers)
- `backend/package-lock.json` (auto-généré)
- `frontend/package-lock.json` (auto-généré)

---

## 🔧 Changements détaillés

### 1. Backend - Cookie Parser

**`backend/src/main.ts`**

```typescript
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ✅ Nouveau : Activer la lecture des cookies
  app.use(cookieParser());
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Important pour les cookies
  });
  
  // ✅ Écouter sur 0.0.0.0 pour Docker
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
```

---

### 2. Backend - JWT Strategy

**`backend/src/auth/jwt.strategy.ts`**

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // ✅ Nouveau : Extraire JWT depuis cookies EN PRIORITÉ
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
}
```

**Ordre de priorité :**
1. Cookies (`access_token`) ← **Nouveau**
2. Header `Authorization: Bearer <token>` ← **Fallback pour compatibilité**

---

### 3. Frontend - Nouvelles API Routes

#### **`frontend/app/api/users/route.ts`** (nouveau)

```typescript
import { NextRequest, NextResponse } from "next/server";

// GET all users
export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' // Docker networking
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch users" },
        { status: response.status }
      );
    }

    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in /api/users GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create user" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/users POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

#### **Pattern des API Routes :**
1. ✅ Extraire token des cookies
2. ✅ Vérifier l'authentification
3. ✅ Utiliser `backend:3001` pour Docker
4. ✅ Forwarder la requête au backend
5. ✅ Retourner la réponse

---

### 4. Frontend - Utilisation des API Routes

**`frontend/app/admin/users/page.tsx`**

#### Avant ❌

```typescript
const fetchUsers = async () => {
  const token = localStorage.getItem("access_token"); // ❌ Insécurisé
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setUsers(data);
};
```

#### Maintenant ✅

```typescript
const fetchUsers = async () => {
  const res = await fetch('/api/users', { // ✅ API Route
    credentials: "include", // ✅ Envoie les cookies
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    setUsers(data);
  }
};
```

#### Changements clés :
- ❌ Plus de `localStorage.getItem()`
- ❌ Plus de header `Authorization`
- ❌ Plus d'appel direct au backend
- ✅ Appel à `/api/users` (Next.js)
- ✅ `credentials: "include"` pour cookies
- ✅ Meilleure gestion d'erreurs

---

## 🚀 Guide de migration

### Pour les développeurs

#### Étape 1 : Pull les changements

```bash
git checkout backoffice
git pull origin backoffice
```

#### Étape 2 : Rebuild Docker

```bash
# Arrêter les containers
docker-compose -f docker-compose.dev.yml down

# Rebuild avec les nouvelles dépendances
docker-compose -f docker-compose.dev.yml up --build
```

#### Étape 3 : Clear storage et re-login

1. Ouvrir DevTools → Application → Storage
2. Clear `localStorage` et `Cookies`
3. Se reconnecter à l'application

---

### Comment migrer votre code

#### Si vous utilisez localStorage

**Avant ❌ :**
```typescript
const token = localStorage.getItem("access_token");
fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Créer une API Route ✅ :**

```typescript
// frontend/app/api/votre-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/votre-endpoint`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Utiliser dans votre composant ✅ :**

```typescript
const fetchData = async () => {
  const res = await fetch('/api/votre-endpoint', {
    credentials: "include",
  });
  const data = await res.json();
  // ...
};
```

---

## 👥 Impact sur l'équipe

### ⚠️ Breaking Changes

1. **Re-login obligatoire**
   - Les tokens localStorage ne fonctionnent plus
   - Tout le monde doit se reconnecter

2. **Code existant à migrer**
   - Si vous avez du code qui utilise `localStorage` pour auth
   - Créer des API routes correspondantes

### ✅ Pas d'impact

1. **Routes backend** → Inchangées
2. **Base de données** → Aucun changement
3. **JWT Tokens** → Même format, juste dans cookies

---

## 💻 Exemples de code

### Fetch GET avec cookies

```typescript
const fetchUsers = async () => {
  try {
    const res = await fetch('/api/users', {
      credentials: "include",
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

### Fetch POST avec cookies

```typescript
const createUser = async (userData: any) => {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create user');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

### Fetch PATCH avec cookies

```typescript
const updateUser = async (id: number, updates: any) => {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

### Fetch DELETE avec cookies

```typescript
const deleteUser = async (id: number) => {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      credentials: "include",
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete user');
    }
    
    return true;
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🧪 Tests

### Tester l'authentification par cookies

1. **Login**
   ```bash
   # Vérifier que le cookie est défini
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"password"}' \
     -c cookies.txt
   ```

2. **Utiliser le cookie**
   ```bash
   # Faire une requête avec le cookie
   curl http://localhost:3000/api/users \
     -b cookies.txt
   ```

3. **Vérifier dans le navigateur**
   - DevTools → Application → Cookies
   - Chercher `access_token`
   - Vérifier `HttpOnly: true` ✅

---

## 🐛 Troubleshooting

### Problème : "Non authentifié" / 401 Error

**Cause possible :**
- Cookie non envoyé
- Cookie expiré
- CORS mal configuré

**Solution :**
```typescript
// Vérifier que credentials est bien inclus
fetch('/api/endpoint', {
  credentials: "include", // ← Important !
});
```

---

### Problème : Cookie non défini après login

**Cause possible :**
- Backend CORS non configuré avec `credentials: true`

**Solution :**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // ← Important !
});
```

---

### Problème : "Failed to fetch" dans Docker

**Cause possible :**
- URL backend incorrecte dans les API routes

**Solution :**
```typescript
// Utiliser backend:3001 dans Docker
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
  ? 'http://backend:3001' // ← Pour Docker
  : process.env.NEXT_PUBLIC_API_URL;
```

---

### Problème : localStorage encore utilisé

**Cause possible :**
- Code non migré

**Solution :**
1. Rechercher `localStorage` dans le projet :
   ```bash
   grep -r "localStorage" frontend/
   ```
2. Migrer vers API routes

---

## 📚 Références

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HTTP-only Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [NestJS Cookie Parser](https://docs.nestjs.com/techniques/cookies)

---

## 👤 Contact

**Questions ou problèmes ?**
- Créer une issue sur le repo
- Me contacter directement
- Consulter les exemples dans `frontend/app/api/users/`

---

**Bon code ! 💻🚀**

*Document mis à jour le 11 Décembre 2025*

