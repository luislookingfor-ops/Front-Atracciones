-- ************************************************************
-- FULL DATABASE SCHEMA
-- Contiene: Identity, Catalog, Booking, Billing
-- ************************************************************

-- ============================================================
-- 1. DB_IDENTITY (Identidad y Perfiles)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE identity_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_by VARCHAR(256), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE role (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(50) NOT NULL UNIQUE, description TEXT);
CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(256) NOT NULL UNIQUE, password_hash TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, reset_password_token VARCHAR(255), reset_password_expiry TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE user_role (user_id UUID REFERENCES users(id) ON DELETE CASCADE, role_id UUID REFERENCES role(id), PRIMARY KEY (user_id, role_id) );
CREATE TABLE client (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(20), location_name VARCHAR(150), preferred_lang_code VARCHAR(5), created_at TIMESTAMPTZ DEFAULT NOW());

-- ============================================================
-- 2. DB_CATALOG (El corazón de la información)
-- ============================================================
CREATE TABLE catalog_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE language (id SMALLSERIAL PRIMARY KEY, iso_code VARCHAR(5) NOT NULL UNIQUE, name VARCHAR(50) NOT NULL, is_active BOOLEAN DEFAULT TRUE);
CREATE TABLE media_type (id SMALLINT PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE);
CREATE TABLE ticket_category (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(50) NOT NULL, name_en VARCHAR(80) NOT NULL, age_range_min SMALLINT, age_range_max SMALLINT);
CREATE TABLE locations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, type VARCHAR(50) NOT NULL, parent_id UUID REFERENCES locations(id));
CREATE TABLE category (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(100) NOT NULL, icon_url TEXT);
CREATE TABLE category_translation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), category_id UUID REFERENCES category(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), name VARCHAR(100) NOT NULL, UNIQUE (category_id, language_id));
CREATE TABLE subcategory (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), category_id UUID REFERENCES category(id) ON DELETE CASCADE, slug VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(100) NOT NULL);
CREATE TABLE subcategory_translation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subcategory_id UUID REFERENCES subcategory(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), name VARCHAR(100) NOT NULL, UNIQUE (subcategory_id, language_id));
CREATE TABLE tag (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(50) NOT NULL, slug VARCHAR(50) NOT NULL UNIQUE);
CREATE TABLE inclusion_item (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), icon_slug VARCHAR(50), default_text TEXT NOT NULL, language_id SMALLINT REFERENCES language(id));

CREATE TABLE attraction (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), location_id UUID REFERENCES locations(id), subcategory_id UUID REFERENCES subcategory(id), slug VARCHAR(200) NOT NULL UNIQUE, name VARCHAR(150) NOT NULL, is_active BOOLEAN DEFAULT TRUE, is_published BOOLEAN DEFAULT FALSE);
CREATE TABLE attraction_translation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), name VARCHAR(150) NOT NULL, description_full TEXT, UNIQUE (attraction_id, language_id));
CREATE TABLE attraction_tag (attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, tag_id UUID REFERENCES tag(id) ON DELETE CASCADE, PRIMARY KEY (attraction_id, tag_id));
CREATE TABLE attraction_inclusion (attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, inclusion_item_id UUID REFERENCES inclusion_item(id), type VARCHAR(20) NOT NULL);
CREATE TABLE attraction_language (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), guide_type VARCHAR(20) NOT NULL);
CREATE TABLE attraction_media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, media_type_id SMALLINT REFERENCES media_type(id), url TEXT NOT NULL, is_main BOOLEAN DEFAULT FALSE);

CREATE TABLE product_option (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, slug VARCHAR(150) NOT NULL, title VARCHAR(150) NOT NULL);
CREATE TABLE product_translation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID REFERENCES product_option(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), title VARCHAR(150) NOT NULL, UNIQUE (product_id, language_id));
CREATE TABLE price_tier (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID REFERENCES product_option(id) ON DELETE CASCADE, ticket_category_id UUID REFERENCES ticket_category(id), price NUMERIC(12,2) NOT NULL, currency_code CHAR(3) DEFAULT 'USD');

CREATE TABLE tour_itinerary (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), title VARCHAR(150) NOT NULL);
CREATE TABLE tour_stop (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), itinerary_id UUID REFERENCES tour_itinerary(id) ON DELETE CASCADE, stop_number SMALLINT NOT NULL, name VARCHAR(150) NOT NULL);
CREATE TABLE audio_guide (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attraction_id UUID REFERENCES attraction(id) ON DELETE CASCADE, language_id SMALLINT REFERENCES language(id), title VARCHAR(150) NOT NULL);

-- ============================================================
-- 3. DB_BOOKING (Inventario y Reservas)
-- ============================================================
CREATE TABLE booking_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE booking_status (id SMALLINT PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE);
CREATE TABLE availability_slot (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, slot_date DATE NOT NULL, start_time TIME NOT NULL, capacity_total SMALLINT NOT NULL, capacity_available SMALLINT NOT NULL, UNIQUE (product_id, slot_date, start_time));

CREATE TABLE booking (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, pnr_code VARCHAR(8) NOT NULL UNIQUE, user_id UUID NOT NULL, slot_id UUID REFERENCES availability_slot(id), status_id SMALLINT REFERENCES booking_status(id), total_amount NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE booking_detail (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID REFERENCES booking(id) ON DELETE CASCADE, price_tier_id UUID NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, ticket_category_name VARCHAR(100) NOT NULL, unit_price NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL);

CREATE TABLE review_criteria (id SMALLINT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);
CREATE TABLE review (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL UNIQUE REFERENCES booking(id), user_id UUID NOT NULL, attraction_id UUID NOT NULL, overall_score NUMERIC(3,2) NOT NULL, comment TEXT);
CREATE TABLE review_rating (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_id UUID REFERENCES review(id) ON DELETE CASCADE, criteria_id SMALLINT REFERENCES review_criteria(id), score SMALLINT NOT NULL);
CREATE TABLE review_media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_id UUID REFERENCES review(id) ON DELETE CASCADE, url TEXT NOT NULL);

-- ============================================================
-- 4. DB_BILLING (Facturación)
-- ============================================================
CREATE TABLE billing_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE payment_status_type (id SMALLINT PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE);
CREATE TABLE payment_method_type (id SMALLINT PRIMARY KEY, name VARCHAR(30) NOT NULL UNIQUE);

CREATE TABLE payment (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, booking_id UUID NOT NULL, payment_method_id SMALLINT REFERENCES payment_method_type(id), status_id SMALLINT REFERENCES payment_status_type(id), amount NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL);

CREATE TABLE invoice (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL, invoice_number VARCHAR(20) NOT NULL UNIQUE, customer_name VARCHAR(150) NOT NULL, tax_id VARCHAR(20) NOT NULL, total NUMERIC(12,2) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE invoice_detail (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID REFERENCES invoice(id) ON DELETE CASCADE, description VARCHAR(255) NOT NULL, quantity INTEGER NOT NULL, unit_price NUMERIC(12,2) NOT NULL, total_item NUMERIC(12,2) NOT NULL);
