# 🎨 SatisClient Design System

## Couleur Principale : **#3a5a40** (Vert Forêt)

---

## 📊 **Progress Metric Card**

Card animée avec graphique intégré, responsive et interactive.

### **Features**
- ✅ **Responsive** : Mobile (1 col) → Tablet (1 col) → Desktop (2 cols)
- ✅ **Interactive** : Hover sur le graphique + changement de période
- ✅ **2 vues** : Courbe (curve) ou Barres (bars)
- ✅ **Accent colors** : forest (#3a5a40), emerald, rose, amber, blue, neutral
- ✅ **Stats auto** : Peak, Low, Average calculés automatiquement
- ✅ **3 tailles** : sm (260px), md (380px), lg (460px)

### **Usage Basique**

```tsx
import ProgressMetricCard from '@/components/ui/progress-metric-card';

<ProgressMetricCard
  title="Total Feedbacks"
  unit="feedbacks"
  accent="forest"  // Utilise #3a5a40
  data={[
    { value: 100, date: '18 Mar' },
    { value: 115, date: '21 Mar' },
    { value: 120, date: '24 Mar' },
    // ...
  ]}
  size="md"
/>
```

### **Props Principales**

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Titre de la métrique |
| `data` | SeriesPoint[] | Données du graphique `{ value, date }` |
| `accent` | 'forest' \| 'emerald' \| 'rose' \| 'amber' \| 'blue' \| 'neutral' | Couleur d'accent |
| `unit` | string | Unité (feedbacks, points, %, etc.) |
| `size` | 'sm' \| 'md' \| 'lg' | Taille de la card |
| `trend` | 'up' \| 'down' | Force le sens de la tendance |
| `showStats` | boolean | Affiche peak/low/avg (défaut: true) |
| `defaultView` | 'curve' \| 'bars' | Vue par défaut |
| `loading` | boolean | État de chargement |

### **Multi-séries**

```tsx
<ProgressMetricCard
  title="Performance"
  series={[
    {
      name: 'Feedbacks',
      data: [...],
      accent: 'forest',
    },
    {
      name: 'Réclamations',
      data: [...],
      accent: 'rose',
    },
  ]}
/>
```

### **Responsive Grid**

```tsx
{/* Mobile: 1 col, Desktop: 2 cols */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  <ProgressMetricCard ... />
  <ProgressMetricCard ... />
  <ProgressMetricCard ... />
  <ProgressMetricCard ... />
</div>

{/* Desktop: 3 cols */}
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <ProgressMetricCard size="sm" ... />
  <ProgressMetricCard size="sm" ... />
  <ProgressMetricCard size="sm" ... />
</div>
```

---

## 📊 **Compact Stats Cards**

Mini-cards avec sparkline charts intégrés (Recharts).

### **Features**
- ✅ **Compact** : Mini-graphiques inline
- ✅ **Responsive** : 1 col mobile → 2 cols tablet → 3 cols desktop
- ✅ **Sparklines** : Area charts avec gradients
- ✅ **Couleur #3a5a40** pour positif
- ✅ **Hover effect** subtil

### **Usage**

```tsx
import Stats4 from '@/components/ui/stats-4';

<Stats4 />
```

**Le composant inclut déjà les données et la mise en page responsive.**

### **Données Personnalisées**

Modifier directement dans `stats-4.tsx` :

```tsx
const summary = [
  {
    name: "Feedbacks",
    tickerSymbol: "FB",
    value: "3,150",
    change: "+420",
    percentageChange: "+15.4%",
    changeType: "positive",
  },
  // ...
];

const data = [
  { date: "18 Mar", Feedbacks: 100, NPS: 64, Réclamations: 45 },
  // ...
];
```

### **Responsive Breakpoints**

```tsx
{/* 1 col mobile, 2 cols tablet, 3 cols desktop */}
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

---

## 📈 **KPI Card**

Card simple avec motion (Framer Motion hover).

### **Usage**

```tsx
import { KPICard } from '@/components/ui/kpi-card';

<KPICard
  title="Net Promoter Score"
  value={72}
  format="number"
  trend={{
    value: 8,
    isPositive: true,
    label: 'vs mois dernier',
  }}
  sentiment="positive"
  size="hero"
  icon={<TrendingUpIcon className="h-6 w-6" />}
/>
```

### **Formats Disponibles**

- `number` : 1,247
- `percent` : 87.5%
- `currency` : 1 247 FCFA
- `rating` : 4.2 / 5

---

## 🎨 **Buttons**

Buttons avec press feedback (Emil Kowalski style).

### **Usage**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="lg">
  Démarrer
</Button>

<Button variant="outline">
  Documentation
</Button>

<Button variant="primary" loading>
  Loading...
</Button>
```

### **Variants**

| Variant | Couleur | Usage |
|---------|---------|-------|
| `primary` | #3a5a40 | Actions principales |
| `secondary` | Slate | Actions secondaires |
| `accent` | #f17528 (orange) | CTAs importants |
| `outline` | Border primary | Actions tertiaires |
| `ghost` | Transparent | Actions discrètes |
| `danger` | Rouge | Actions destructives |

### **Sizes**

- `sm` : 36px height
- `md` : 44px height (défaut)
- `lg` : 52px height
- `icon` : 40x40px (carré)

---

## 🏷️ **Badges**

### **Status Badge (FSM)**

```tsx
import { StatusBadge } from '@/components/ui/badge';

<StatusBadge status="submitted" />
<StatusBadge status="in_progress" />
<StatusBadge status="resolved" />
```

**Status disponibles :**
- submitted, in_progress, reviewing, approved, rejected
- resolved, closed, implemented, archived

### **Sentiment Badge**

```tsx
import { SentimentBadge } from '@/components/ui/badge';

<SentimentBadge sentiment="positive" />  {/* 😊 Positif */}
<SentimentBadge sentiment="neutral" />   {/* 😐 Neutre */}
<SentimentBadge sentiment="negative" />  {/* 😟 Négatif */}
```

---

## 🎭 **Animations (Emil Kowalski)**

### **Button Press Feedback**

Tous les buttons ont `active:scale-[0.97]` avec `duration-150ms` et `ease-out-custom`.

### **Hover States**

- **Cards** : `hover:border-primary-300 hover:shadow-lg`
- **KPI Cards** : `y: -2px` avec Framer Motion
- **Buttons** : Shadow augmentée

### **Custom Easing**

```css
/* globals.css */
.ease-out-custom {
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
```

### **Reduced Motion**

Respecte `prefers-reduced-motion` automatiquement.

---

## 📱 **Responsive Breakpoints**

```tsx
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### **Layout Responsive**

```tsx
{/* Container responsive */}
<div className="container mx-auto px-4 py-16">
  {/* Grid responsive */}
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {/* Content */}
  </div>
</div>
```

### **Progress Metric Card Responsive**

Mobile (< 768px) :
- Cards en 1 colonne
- Taille automatiquement ajustée
- Stats footer wrap

Desktop (≥ 1024px) :
- 2 ou 3 colonnes selon le design
- Graphique pleine largeur

---

## 🎨 **Palette Complète**

### **Primary (Vert Forêt)**
```
50:  #f4f6f5
100: #e3e9e5
600: #3a5a40  ← COULEUR PRINCIPALE
900: #233226
```

### **Accent (Orange Terre Cuite)**
```
500: #f17528
600: #e35d1e
```

### **Sentiment**
```
positive: #5a7a60  (vert)
neutral:  #f59e0b  (amber)
negative: #dc2626  (rouge)
```

---

## 🚀 **Quick Start Dashboard**

```tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Metrics - Responsive 2 cols */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <ProgressMetricCard
            title="Total Feedbacks"
            accent="forest"
            data={feedbackData}
          />
          <ProgressMetricCard
            title="NPS Score"
            accent="forest"
            data={npsData}
          />
        </div>

        {/* KPI Cards - Responsive 4 cols */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="CSAT" value={4.2} format="rating" />
          <KPICard title="Feedbacks" value={1247} />
          <KPICard title="Réclamations" value={23} sentiment="negative" />
          <KPICard title="Satisfaction" value={87.5} format="percent" />
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ **Checklist Responsive**

- [ ] Testé sur mobile (375px)
- [ ] Testé sur tablet (768px)
- [ ] Testé sur desktop (1024px+)
- [ ] Cards wrap correctement
- [ ] Stats footer wrap sur mobile
- [ ] Controls accessibles au touch
- [ ] Pas de scroll horizontal
- [ ] Touch targets ≥ 44px

---

## 🎯 **Best Practices**

### **1. Toujours utiliser `forest` pour le branding principal**

```tsx
<ProgressMetricCard accent="forest" ... />
<Button variant="primary" ... />
```

### **2. Respecter la hiérarchie des couleurs**

- **Primary actions** : Vert forêt (#3a5a40)
- **CTAs importants** : Orange accent (#f17528)
- **Succès** : Emerald
- **Erreur** : Rose/Red
- **Warning** : Amber

### **3. Mobile-first responsive**

Toujours coder en mobile-first avec Tailwind :

```tsx
{/* Mobile par défaut, puis breakpoints */}
<div className="px-4 md:px-6 lg:px-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
```

### **4. Animations légères**

- Max 300ms pour les UI animations
- Press feedback à 150ms
- Hover transitions à 200ms

### **5. Dark mode ready**

Tous les composants supportent dark mode automatiquement via `next-themes`.

---

**🎨 Design System by SatisClient · Powered by #3a5a40**
