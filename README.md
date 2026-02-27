# GeoLúpulus Dashboard 🧭

Dashboard d'anàlisi d'esdeveniments de geocaching, construït amb React + Vite + Tailwind CSS.

## 🚀 Posada en marxa

```bash
# Instal·la les dependències
npm install

# Inicia el servidor de desenvolupament
npm run dev

# Compila per a producció
npm run build
```

## 📁 Estructura del projecte

```
src/
├── components/
│   ├── FilterSelect.jsx   # Selector de filtre reutilitzable
│   ├── MilestoneMedal.jsx # Medalles per edicions especials (50, 100, 150)
│   └── StatCard.jsx       # Targeta de estadística
├── hooks/
│   └── useEventData.js    # Fetch i parse de Google Sheets
├── utils/
│   ├── constants.js       # URLs de Google Sheets
│   ├── milestones.js      # Estils i configs de fites
│   └── parseCSV.js        # Parser de CSV
├── styles/
│   └── index.css          # Tailwind + estils globals
├── App.jsx                # Component principal
└── main.jsx               # Punt d'entrada
```

## ☁️ Deploy a Vercel

1. Puja el projecte a GitHub
2. Connecta el repositori a [vercel.com](https://vercel.com)
3. Vercel detecta Vite automàticament → Deploy!

Cada `git push` farà un nou deploy automàticament.

## 🛠 Tecnologies

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Lucide React](https://lucide.dev/)
