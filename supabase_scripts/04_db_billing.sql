-- ************************************************************
-- DB_BILLING (Facturación)
-- ************************************************************
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE billing_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE payment_status_type (id SMALLINT PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE);
CREATE TABLE payment_method_type (id SMALLINT PRIMARY KEY, name VARCHAR(30) NOT NULL UNIQUE);

CREATE TABLE payment (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, booking_id UUID NOT NULL, payment_method_id SMALLINT REFERENCES payment_method_type(id), status_id SMALLINT REFERENCES payment_status_type(id), amount NUMERIC(12,2) NOT NULL, currency_code CHAR(3) NOT NULL);

CREATE TABLE invoice (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL, invoice_number VARCHAR(20) NOT NULL UNIQUE, customer_name VARCHAR(150) NOT NULL, tax_id VARCHAR(20) NOT NULL, total NUMERIC(12,2) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE invoice_detail (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID REFERENCES invoice(id) ON DELETE CASCADE, description VARCHAR(255) NOT NULL, quantity INTEGER NOT NULL, unit_price NUMERIC(12,2) NOT NULL, total_item NUMERIC(12,2) NOT NULL);
