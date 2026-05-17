-- ************************************************************
-- DB_BOOKING (Inventario y Reservas)
-- ************************************************************
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE booking_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE booking_status (id SMALLINT PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE);
CREATE TABLE availability_slot (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, slot_date DATE NOT NULL, start_time TIME NOT NULL, capacity_total SMALLINT NOT NULL, capacity_available SMALLINT NOT NULL, UNIQUE (product_id, slot_date, start_time));

CREATE TABLE booking (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, pnr_code VARCHAR(8) NOT NULL UNIQUE, user_id UUID NOT NULL, slot_id UUID REFERENCES availability_slot(id), status_id SMALLINT REFERENCES booking_status(id), total_amount NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE booking_detail (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID REFERENCES booking(id) ON DELETE CASCADE, price_tier_id UUID NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, ticket_category_name VARCHAR(100) NOT NULL, unit_price NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL);

CREATE TABLE review_criteria (id SMALLINT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);
CREATE TABLE review (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL UNIQUE REFERENCES booking(id), user_id UUID NOT NULL, attraction_id UUID NOT NULL, overall_score NUMERIC(3,2) NOT NULL, comment TEXT);
CREATE TABLE review_rating (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_id UUID REFERENCES review(id) ON DELETE CASCADE, criteria_id SMALLINT REFERENCES review_criteria(id), score SMALLINT NOT NULL);
CREATE TABLE review_media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_id UUID REFERENCES review(id) ON DELETE CASCADE, url TEXT NOT NULL);
