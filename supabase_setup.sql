-- =====================================================
-- ЗАПУСТИ ЦЕЙ ФАЙЛ В SUPABASE → SQL EDITOR
-- Виконуй по одному блоку (між ---) якщо щось не так
-- =====================================================

-- 1. PROFILES
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   VARCHAR(200),
  phone       VARCHAR(20),
  role        VARCHAR(20) DEFAULT 'user',
  avatar_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE service_categories (
  id    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  slug  VARCHAR(100) UNIQUE,
  icon_url TEXT
);

INSERT INTO service_categories (name, slug) VALUES
  ('Тури',      'tours'),
  ('Готелі',    'hotels'),
  ('Екскурсії', 'excursions'),
  ('Трансфери', 'transfers');

-- 3. SERVICES
CREATE TABLE services (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id   UUID REFERENCES service_categories(id),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  base_price    DECIMAL(10,2) NOT NULL,
  max_capacity  INTEGER DEFAULT 10,
  location_city VARCHAR(100),
  location_lat  DECIMAL(10,8),
  location_lng  DECIMAL(11,8),
  rating_avg    DECIMAL(3,2) DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  images        TEXT[],
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BOOKINGS
CREATE TABLE bookings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id       UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_number   VARCHAR(20) UNIQUE,
  status           VARCHAR(20) DEFAULT 'pending',
  start_date       DATE NOT NULL,
  end_date         DATE,
  guests_count     INTEGER DEFAULT 1,
  total_price      DECIMAL(12,2) NOT NULL,
  currency         VARCHAR(3) DEFAULT 'UAH',
  special_requests TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAYMENTS
CREATE TABLE payments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id        UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  amount            DECIMAL(12,2) NOT NULL,
  payment_method    VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  status            VARCHAR(20) DEFAULT 'pending',
  paid_at           TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. REVIEWS
CREATE TABLE reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id  UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating      SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, booking_id)
);

-- =====================================================
-- ТРИГЕР: автоматично створює профіль при реєстрації
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ТРИГЕР: оновлює рейтинг послуги після відгуку
-- =====================================================
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET rating_avg = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
  )
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_service_rating();

-- =====================================================
-- ROW LEVEL SECURITY (захист даних)
-- =====================================================
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews    ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users see own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- services: всі читають активні, провайдер керує своїми
CREATE POLICY "Anyone reads active services"
  ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Provider inserts services"
  ON services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Provider updates own services"
  ON services FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Provider deletes own services"
  ON services FOR DELETE USING (auth.uid() = provider_id);

-- bookings
CREATE POLICY "Users see own bookings"
  ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings"
  ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- reviews: всі читають
CREATE POLICY "Anyone reads reviews"
  ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth users write reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- service_categories: публічне читання
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads categories"
  ON service_categories FOR SELECT USING (true);

-- =====================================================
-- ТЕСТОВІ ДАНІ (необов'язково, для демонстрації)
-- =====================================================
-- Спочатку зареєструйся через застосунок,
-- потім знайди свій UUID в Authentication → Users
-- і встав нижче замість 'ВАШ-UUID-ТУТ'

-- INSERT INTO services (provider_id, category_id, name, description, base_price, max_capacity, location_city, images)
-- SELECT
--   'ВАШ-UUID-ТУТ',
--   (SELECT id FROM service_categories WHERE slug = 'tours'),
--   'Тур до Карпат на 3 дні',
--   'Незабутня подорож до мальовничих Карпат. Включає трансфер, проживання та гіда.',
--   2500,
--   15,
--   'Карпати',
--   ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&fit=crop'];
