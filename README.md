# 🎰 JACKPOT / NeonVault — Cyber Casino Platform

Nowoczesna platforma gier kasynowych i zręcznościowych online w neonowej estetyce Cyberpunk. Zbudowana w oparciu o React 19, Tailwind CSS v4, TypeScript, Express.js i Prisma ORM.

---

## 🚀 Technologie

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Framer Motion, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT + Refresh Tokens), Bcrypt.js, Zod
- **Baza danych**: SQLite (domyślnie), pełne wsparcie dla PostgreSQL i MySQL (Railway, Supabase, Neon, AWS RDS)
- **Architektura**: Provably Fair, pełna autoryzacja ról (USER, MODERATOR, ADMIN, OWNER)

---

## 🎮 Dostępne Gry

1. **Crash (Rakieta)** — Obserwuj rosnący mnożnik i wypłać zanim rakieta eksploduje.
2. **Jackpot (Arena)** — Pula wspólna ze szansami procentowymi wg wpłaconej stawki.
3. **Miny (Saper)** — Zbieraj kryształy na siatce 5x5 unikając ukrytych min.
4. **Plinko (Piramida kołków)** — Fizyka kulek wpadających do mnożników do 50x.
5. **Coinflip (Rzut Monetą)** — Szybki pojedynek 50/50 z mnożnikiem 2.0x.
6. **Koło Fortuny (Ruletka)** — Zakłady na kolory i sektory 2x, 3x, 5x, 20x.
7. **Zdrapki (Cyber Scratch)** — Odkrywaj pola i wygrywaj instant nagrody.
8. **Blackjack 21** — Hit, Stand, Double Down, wypłata 2.4x za naturalnego Blackjacka.
9. **Puzzle Rush** — Gra logiczno-zręcznościowa na refleks, pamięć i accuracy.
10. **Neon Train** — Przejazd pociągiem przez 8 stacji neonowego metra (mnożnik do 16x).

---

## ⚙️ Wymagania

- Node.js v18+ lub v20+ / v22+
- npm v9+

---

## 🛠️ Uruchomienie Lokalne (Development)

1. Zainstaluj zależności w głównym folderze i w serwerze:
   ```bash
   npm install
   npm install --prefix server
   ```

2. Przygotuj bazę danych:
   ```bash
   cd server
   npx prisma migrate dev
   npm run db:seed
   cd ..
   ```

3. Uruchom serwer i frontend jednocześnie:
   ```bash
   npm run dev:all
   ```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 🌐 Wdrożenie na Hosting (Production)

Platforma jest przygotowana do wdrożenia w dwóch modelach:

### Model 1: Jeden serwer (Full-Stack na jednym porcie) — NAJPROSTSZY
> Rekomendowane dla: **Railway, Render, VPS, Coolify, Fly.io, Heroku, Docker**

W tym modelu Express serwuje zarówno API (`/api/*`), jak i skompilowany frontend React (`dist`):

1. **Zbuduj cały projekt**:
   ```bash
   npm run build:all
   ```
2. **Ustaw zmienne środowiskowe** w pliku `server/.env` (lub w panelu hostingu):
   ```env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL="file:./jackpot.db"
   JWT_SECRET="twoj-bezpieczny-klucz-jwt-w-produkcji"
   JWT_REFRESH_SECRET="twoj-bezpieczny-klucz-refresh-jwt-w-produkcji"
   ```
3. **Uruchom serwer produkcyjny**:
   ```bash
   npm start
   ```

Aplikacja będzie dostępna pod jednym adresem (np. `https://twojadomena.pl`).

---

### Model 2: Osobny Frontend (Vercel / Netlify) + Osobny Backend (Railway / Render)

1. **Backend (np. Railway)**:
   - Wdróż folder `server`
   - Ustaw zmienną `CLIENT_URL="https://twoj-frontend.vercel.app"`
2. **Frontend (np. Vercel)**:
   - Wdróż główny katalog
   - Ustaw zmienną środowiskową:
     ```env
     VITE_API_URL="https://twoj-backend.railway.app"
     ```

---

### 🐳 Uruchomienie przez Docker

```bash
docker compose up --build -d
```

Aplikacja wystartuje automatycznie pod adresem `http://localhost:3001`.

---

## 🗄️ Podłączenie Produkcyjnej Bazy Danych (PostgreSQL / MySQL)

Domyślnie używany jest SQLite (`file:./jackpot.db`). Aby podłączyć zewnętrzną bazę (np. Supabase, Neon, Railway Postgres):

1. W pliku `server/prisma/schema.prisma` zmień provider:
   ```prisma
   datasource db {
     provider = "postgresql" // lub "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. W zmiennej `DATABASE_URL` podaj swój connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/jackpot?sslmode=require"
   ```
3. Zsynchronizuj schemat bazy:
   ```bash
   cd server
   npx prisma db push
   npm run db:seed
   ```

---

## 👑 Domyślne Dane Administratora (Owner)

Po uruchomieniu seeda (`npm run db:seed`):
- **Login**: `kondom`
- **Hasło**: `Kondzio25!`
- **Rola**: `OWNER` (Pełny dostęp do Panelu Administratora)
- **Startowe monety**: 1 000 monet | 5 gemów
- **Ekwipunek**: czysty start
