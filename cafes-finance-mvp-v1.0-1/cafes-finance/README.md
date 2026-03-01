# CAFÉS-FINANCE × GHP — MVP PWA v1.0
### TINI/SYSTEME · Finance Ethnique & Solidaire · Phase Pilote Dakar 2025

---

## Structure du projet

```
cafes-finance/
├── index.html          → Application principale (HTML/structure)
├── manifest.json       → Configuration PWA (installation native)
├── sw.js               → Service Worker (offline-first, cache)
│
├── css/
│   └── style.css       → Design System complet (Afrofuturiste Luxe)
│
├── js/
│   └── app.js          → Logique applicative (12 modules)
│
└── icons/
    ├── icon-192.svg    → Icône app (192×192)
    └── icon-512.svg    → Icône app (512×512)
```

---

## Modules JavaScript (`js/app.js`)

| Module | Rôle |
|--------|------|
| `FIB`  | Moteur Fibonacci × Euler — Cryptographie TINI/SYSTEME |
| `S`    | Store localStorage — Persistance données locales |
| `F`    | Formatage — FCFA, dates, pourcentages |
| `DATA` | Données pilote — Formations, offres, tontines |
| `Sim`  | Simulateurs — Prêt, épargne, assurance, investissement |
| `CH`   | Charts — Chart.js thémé (5 types de graphiques) |
| `Calc` | Calculateurs temps réel — Liaison inputs → résultats |
| `BC`   | Blockchain locale — Blocs, transactions, minage |
| `UI`   | Interface — Render, navigation, composants |
| `Act`  | Actions — CRUD, transactions, formulaires |
| `App`  | Core — Lifecycle, routing, modals, toasts, PWA |
| `OB`   | Onboarding — 3 slides intro |

---

## Déploiement en 3 minutes

### Option 1 — GitHub Pages (recommandé, gratuit)

```bash
# 1. Créer un repo GitHub "cafes-finance-ghp"
# 2. Uploader le dossier entier
git init
git add .
git commit -m "CAFÉS-FINANCE MVP v1.0 — TINI/SYSTEME"
git remote add origin https://github.com/[user]/cafes-finance-ghp.git
git push -u origin main

# 3. Activer GitHub Pages
# Settings → Pages → Branch: main → Root: / → Save
# URL: https://[user].github.io/cafes-finance-ghp/
```

### Option 2 — Netlify (drag & drop)

1. Aller sur [netlify.com](https://netlify.com)
2. Glisser-déposer le dossier `cafes-finance/`
3. URL générée instantanément avec HTTPS ✓

### Option 3 — Vercel CLI

```bash
npm i -g vercel
cd cafes-finance/
vercel --prod
```

### Option 4 — Serveur VPS Africain (production)

```bash
# Sur serveur Ubuntu/Nginx
sudo cp -r cafes-finance/ /var/www/cafes-finance/
sudo nano /etc/nginx/sites-available/cafes-finance

# Config Nginx:
server {
    listen 80;
    server_name cafes-finance.sn;
    root /var/www/cafes-finance;
    index index.html;
    add_header Service-Worker-Allowed /;
    try_files $uri $uri/ /index.html;
}

sudo certbot --nginx -d cafes-finance.sn  # HTTPS Let's Encrypt
sudo nginx -t && sudo nginx -s reload
```

---

## Installation PWA (utilisateurs)

### Android (Chrome/Edge)
1. Ouvrir l'URL dans Chrome
2. Banner "Ajouter à l'écran d'accueil" → Installer
3. Ou : Menu ⋮ → Installer l'application

### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Bouton Partager ⬆ → Sur l'écran d'accueil
3. Nommer "CAFÉS-FINANCE" → Ajouter

### Desktop (Chrome/Edge)
1. Icône d'installation dans la barre d'adresse
2. Ou : Menu → Installer CAFÉS-FINANCE

---

## Fonctionnalités MVP

| Fonctionnalité | Statut |
|----------------|--------|
| Identité TINI (Fibonacci × Euler) | ✅ Opérationnel |
| HopeScore™ (0-100, 4 tiers) | ✅ Opérationnel |
| Dépôt / Retrait / Transfert | ✅ Opérationnel |
| Orange Money · Wave · MTN MoMo | ✅ Simulé |
| HopeFund™ (4 produits prêt) | ✅ Opérationnel |
| Tontines GHP (création + public) | ✅ Opérationnel |
| Simulateurs (prêt/épargne/ass/invest) | ✅ Opérationnel |
| HopeSkills™ (7 formations) | ✅ Opérationnel |
| HopeWork™ (7 offres emploi) | ✅ Opérationnel |
| Épargne (3 produits) | ✅ Opérationnel |
| Assurance Micro (4 produits) | ✅ Opérationnel |
| Blockchain locale Fibonacci | ✅ Opérationnel |
| Mode hors ligne (Service Worker) | ✅ Opérationnel |
| Installation PWA native | ✅ Opérationnel |
| Export données JSON | ✅ Opérationnel |
| Onboarding 3 slides | ✅ Opérationnel |
| USSD *785# (simulation) | ✅ Opérationnel |

---

## Données de test (phase pilote)

L'application démarre avec des données statiques :
- **7 formations** HopeSkills™ (dont 6 certifiantes blockchain)
- **7 offres** HopeWork™ (Dakar, Bamako, Abidjan)
- **3 tontines** publiques disponibles

Toutes les transactions sont stockées en **localStorage** préfixé `tini_`.

---

## Roadmap Phase 2

- [ ] API REST TINI/SYSTEME (Node.js + PostgreSQL)
- [ ] Mobile Money réel (Orange, Wave, MTN API)
- [ ] KYC 3 niveaux (Basic / Standard / Enhanced)
- [ ] Certifications NFT Polygon (HopeSkills™)
- [ ] USSD réel *785# (PosteFinances SN)
- [ ] Multilingue (Wolof, Bambara, Dioula)

---

## Contact & Support

**CAFÉS-FINANCE × Genius-Hope Phygital**  
Thiaw Consulting TCS  
📍 Dakar, Sénégal  
📧 servicecafes.finance@gmail.com  
📱 +221 77 844 42 61  
📲 USSD `*785#`  
🔐 TINI/SYSTEME v1.0 — `Fibonacci × Euler × SHA3-512`

---

*MVP Phase Pilote 2025 · Tous droits réservés TCS*
