# Obli - Plateforme Lost & Found Premium

Une application moderne et élégante pour déclarer et retrouver des objets perdus avec QR codes personnalisés, chat en temps réel, et paiement intégré.

## 🚀 Technologies

- **Frontend**: React 18 + Vite 6
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4 (sans PostCSS ni Autoprefixer)
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Icons**: Lucide React
- **Internationalisation**: i18next (FR/EN)
- **QR Codes**: qrcode.react + html5-qrcode

## ✨ Fonctionnalités

- ✅ Authentification sécurisée (email/password)
- ✅ Déclaration d'objets perdus/trouvés
- ✅ Recherche et filtrage avancés
- ✅ **Paiement 500 FCFA** pour débloquer les détails d'un objet
- ✅ **Boutique QR Codes** personnalisés avec autocollants
- ✅ **Scanner QR** avec envoi automatique SMS/Email
- ✅ **Chat en temps réel** entre trouveurs et propriétaires
- ✅ Mode Dark/Light avec transition fluide
- ✅ Support multilingue (Français/Anglais)
- ✅ Section téléchargement app mobile
- ✅ Design responsive et moderne
- ✅ Animations fluides et micro-interactions

## 📦 Installation

1. Clonez le repository
```bash
git clone https://github.com/votre-username/obli.git
cd obli
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement
```bash
cp .env.example .env
```

4. Ajoutez vos credentials Supabase dans `.env`
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

5. Configurez Supabase
- Suivez les instructions dans `SUPABASE_SETUP.md`
- Exécutez les scripts SQL dans `scripts/`

6. Lancez le serveur de développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🏗️ Structure du Projet

```
obli/
├── public/               # Assets statiques et images
├── scripts/              # Scripts SQL Supabase
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ChatList.jsx
│   │   └── ...
│   ├── contexts/         # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── LanguageContext.jsx
│   ├── lib/             # Utilitaires et config
│   │   └── supabase.js
│   ├── pages/           # Pages de l'application
│   │   ├── HomePage.jsx
│   │   ├── ItemListingPage.jsx
│   │   ├── ItemDetailPage.jsx
│   │   ├── QRStorePage.jsx
│   │   ├── QRScannerPage.jsx
│   │   ├── ChatPage.jsx
│   │   └── ...
│   ├── App.jsx          # Configuration des routes
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux Tailwind
├── .env.example         # Template variables d'environnement
├── vite.config.js       # Configuration Vite
└── README.md
```

## 🎨 Design

Inspiré par Apple, Linear et Vercel avec:
- Glassmorphism et effets de profondeur
- Palette de couleurs indigo/émeraude
- Animations Framer Motion fluides
- Typographie moderne (Geist Sans)
- Dark mode premium par défaut

## 🔒 Sécurité

- Row Level Security (RLS) configuré sur Supabase
- Authentification JWT avec Supabase Auth
- Protection des routes sensibles
- Validation des données côté client et serveur
- Paiement sécurisé pour accès aux informations

## 📱 Responsive

L'application est entièrement responsive et optimisée pour:
- 📱 Mobile (320px+)
- 💻 Tablette (768px+)
- 🖥️ Desktop (1024px+)

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Ajoutez les variables d'environnement
5. Déployez !

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Ajoutez les variables d'environnement

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Preview du build
npm run lint     # Lint du code
```

## 🌐 Internationalisation

L'application supporte le français et l'anglais. Le changement de langue se fait via le toggle dans le header.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

Fait avec ❤️ par l'équipe Obli
