-- ************************************************************
-- DB_CATALOG (El corazón de la información)
-- ************************************************************
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
