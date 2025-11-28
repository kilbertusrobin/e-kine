# Design System - E-Kiné

## Palette de couleurs

### Primary (Bleu médical)
Couleur principale utilisée pour les CTA et éléments importants
```
primary-50:  #eff6ff
primary-100: #dbeafe
primary-600: #2563eb  ← Principal
primary-700: #1d4ed8  ← Hover
```

### Accent (Indigo)
Couleur d'accent pour la page Register
```
accent-50:  #eef2ff
accent-100: #e0e7ff
accent-600: #4f46e5  ← Principal
accent-700: #4338ca  ← Hover
```

### Secondary (Cyan)
Couleur secondaire pour les dégradés
```
secondary-600: #0891b2
secondary-700: #0e7490
```

### Neutral (Gris)
Couleurs neutres pour le texte et les bordures
```
neutral-50:  #fafafa  ← Backgrounds
neutral-100: #f5f5f5
neutral-200: #e5e5e5  ← Bordures
neutral-600: #525252  ← Texte secondaire
neutral-900: #171717  ← Texte principal
```

## Composants

### Boutons

**Primary CTA**
```jsx
<button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
  Créer un compte
</button>
```

**Secondary**
```jsx
<button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
  Connexion
</button>
```

**Tertiary**
```jsx
<button className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
  En savoir plus
</button>
```

### Inputs

**Text Input**
```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
  placeholder="Email"
/>
```

**Label**
```jsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Email
</label>
```

### Cards

**Feature Card**
```jsx
<div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary-600 transition-colors">
  <div className="text-primary-600 mb-4">
    {icon}
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Titre</h3>
  <p className="text-gray-600">Description</p>
</div>
```

**Auth Card**
```jsx
<div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
  {/* Contenu */}
</div>
```

## Pages

### Homepage
- Background: `bg-white`
- Sections alternées: blanc / `bg-gray-50`

### Login Page
- Background: `bg-page-login` (dégradé gris clair)
- Panneau visuel: dégradé `from-primary-500 to-primary-700`
- Transition: slide depuis la droite

### Register Page
- Background: `bg-page-register` (dégradé indigo/cyan)
- Panneau visuel: dégradé `from-accent-600 via-primary-600 to-secondary-600`
- Transition: slide depuis la gauche

## Animations

### Transitions de page
```jsx
<PageTransition>
  {children}
</PageTransition>
```

- Login: slide depuis la droite (translate-x-full)
- Register: slide depuis la gauche (-translate-x-full)
- Durée: 700ms avec ease-out

### Hover States
Toujours utiliser `transition-colors` pour les transitions fluides

```jsx
className="hover:bg-primary-700 transition-colors"
```

## Typographie

### Titres
```jsx
<h1 className="text-4xl font-bold text-gray-900">Titre principal</h1>
<h2 className="text-3xl font-bold text-gray-900">Sous-titre</h2>
<h3 className="text-lg font-semibold text-gray-900">Titre de section</h3>
```

### Paragraphes
```jsx
<p className="text-gray-600">Texte normal</p>
<p className="text-sm text-gray-600">Texte petit</p>
<p className="text-xl text-gray-600">Texte large</p>
```

## Espacements

### Sections
- Padding vertical: `py-16` ou `py-20`
- Container max-width: `max-w-7xl` (homepage) ou `max-w-6xl` (auth)

### Cards
- Padding: `p-6` ou `p-8`
- Spacing entre éléments: `space-y-4` ou `space-y-6`

## Responsive

### Breakpoints
- Mobile first par défaut
- Desktop: `md:` (768px+)
- Large desktop: `lg:` (1024px+)

### Split-screen Auth Pages
```jsx
<div className="grid md:grid-cols-2">
  <div className="p-8 md:p-12">{/* Formulaire */}</div>
  <div className="hidden md:flex">{/* Visuel */}</div>
</div>
```

Le panneau visuel est caché sur mobile (`hidden md:flex`)
