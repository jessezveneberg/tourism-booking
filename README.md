# 🗺️ TourBook — Система бронювання туристичних послуг

Повнофункціональний веб-застосунок для бронювання турів, готелів та екскурсій.
Побудований на **React + Supabase**, розгорнутий на **GitHub Pages** — повністю безкоштовно.

---

## 🚀 Як запустити проєкт (покроково)

### КРОК 1 — Встанови Node.js
Завантаж з **nodejs.org** версію 18 або вище. Перевір:
```bash
node --version   # має бути v18+
npm --version
```

### КРОК 2 — Встанови залежності
```bash
# Відкрий термінал у папці проєкту
npm install
```

### КРОК 3 — Створи проєкт у Supabase

1. Зайди на **supabase.com** → увійди через GitHub
2. Натисни **New project**
3. Назва: `tourism-booking`, регіон: **Frankfurt**
4. Збережи пароль від БД
5. Зачекай 2 хвилини поки створиться

### КРОК 4 — Налаштуй базу даних

1. У Supabase Dashboard → **SQL Editor**
2. Відкрий файл `supabase_setup.sql` з цього проєкту
3. Вибери весь текст → натисни **Run**
4. Всі таблиці створяться автоматично ✅

### КРОК 5 — Отримай ключі Supabase

1. Supabase Dashboard → **Project Settings → API**
2. Скопіюй:
   - **Project URL** (виглядає як `https://xxxxx.supabase.co`)
   - **anon public** key (довгий рядок)

### КРОК 6 — Створи файл .env

Скопіюй `.env.example` → перейменуй в `.env`:
```
VITE_SUPABASE_URL=https://ТВІЙ_ПРОЕКТ.supabase.co
VITE_SUPABASE_ANON_KEY=твій_anon_key
```

### КРОК 7 — Запусти локально
```bash
npm run dev
```
Відкриється **http://localhost:5173** — застосунок працює! 🎉

---

## 🌐 Розгортання на GitHub Pages

### КРОК 8 — Створи репозиторій на GitHub

1. github.com → **New repository**
2. Назва: `tourism-booking` (публічний)
3. Не додавай README (він вже є)

### КРОК 9 — Додай секрети GitHub

У репозиторії → **Settings → Secrets and variables → Actions → New secret**:
- `VITE_SUPABASE_URL` = твій URL
- `VITE_SUPABASE_ANON_KEY` = твій ключ

### КРОК 10 — Відправ код на GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/ТВІЙ_НІК/tourism-booking.git
git push -u origin main
```

### КРОК 11 — Увімкни GitHub Pages

**Settings → Pages → Source → GitHub Actions**

Після першого push GitHub автоматично збере і задеплоїть сайт (~2 хв).
Сайт буде на: `https://ТВІЙ_НІК.github.io/tourism-booking`

### КРОК 12 — Додай URL до Supabase

Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://ТВІЙ_НІК.github.io/tourism-booking`
- **Redirect URLs**: той самий URL

---

## 📁 Структура проєкту

```
tourism-booking/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Навігація
│   │   ├── Footer.jsx          # Підвал
│   │   ├── ServiceCard.jsx     # Картка послуги
│   │   ├── Spinner.jsx         # Лоадер
│   │   └── ProtectedRoute.jsx  # Захист роутів
│   ├── context/
│   │   └── AuthContext.jsx     # Глобальний стан авторизації
│   ├── hooks/
│   │   ├── useServices.js      # Хук для роботи з послугами
│   │   └── useBookings.js      # Хук для бронювань
│   ├── pages/
│   │   ├── Home.jsx            # Головна сторінка
│   │   ├── Services.jsx        # Каталог послуг з фільтрами
│   │   ├── ServiceDetail.jsx   # Деталі + форма бронювання
│   │   ├── Auth.jsx            # Вхід / Реєстрація
│   │   ├── MyBookings.jsx      # Мої бронювання
│   │   ├── Profile.jsx         # Профіль користувача
│   │   ├── ProviderDashboard.jsx # Кабінет постачальника
│   │   └── NotFound.jsx        # 404
│   ├── lib/
│   │   └── supabase.js         # Клієнт Supabase
│   ├── App.jsx                 # Роутер
│   ├── main.jsx                # Точка входу
│   └── index.css               # Глобальні стилі (Tailwind)
├── .github/workflows/
│   └── deploy.yml              # Автодеплой на GitHub Pages
├── supabase_setup.sql          # SQL для створення БД
├── .env.example                # Шаблон змінних середовища
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## ✨ Функціонал

| Функція | Статус |
|---------|--------|
| Реєстрація та вхід | ✅ |
| Каталог послуг з фільтрами | ✅ |
| Деталі послуги з галереєю | ✅ |
| Форма бронювання | ✅ |
| Особистий кабінет користувача | ✅ |
| Список моїх бронювань | ✅ |
| Скасування бронювання | ✅ |
| Відгуки та рейтинг | ✅ |
| Кабінет постачальника | ✅ |
| Управління послугами (CRUD) | ✅ |
| Підтвердження бронювань | ✅ |
| Адаптивний дизайн (мобільний) | ✅ |
| Автодеплой GitHub Actions | ✅ |

---

## 🛠️ Технологічний стек

- **Frontend**: React 18 + Vite + TailwindCSS
- **База даних**: Supabase (PostgreSQL)
- **Авторизація**: Supabase Auth
- **Хостинг**: GitHub Pages (безкоштовно)
- **CI/CD**: GitHub Actions

---

## ❓ Часті питання

**Після реєстрації нічого не відбувається?**
Перевір email — Supabase надсилає лист підтвердження. Або в Supabase Dashboard → Authentication → вимкни "Confirm email".

**Як стати постачальником?**
Зареєструйся → Supabase Dashboard → Table Editor → profiles → знайди свій запис → зміни `role` на `provider`.

**Як додати тестові послуги?**
Стань постачальником (крок вище) → зайди на `/provider` → додай послуги через форму.

**Де зберігаються фото?**
Поки що через URL. Для завантаження файлів підключи Supabase Storage (безкоштовно 1 GB).
