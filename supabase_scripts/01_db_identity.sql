-- ************************************************************
-- DB_IDENTITY (Identidad y Perfiles)
-- ************************************************************
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE identity_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), correlation_id UUID, table_name VARCHAR(100), record_id UUID, action VARCHAR(10), changed_by VARCHAR(256), changed_at TIMESTAMPTZ DEFAULT NOW(), old_values JSONB, new_values JSONB);

CREATE TABLE role (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(50) NOT NULL UNIQUE, description TEXT);
CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(256) NOT NULL UNIQUE, password_hash TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, reset_password_token VARCHAR(255), reset_password_expiry TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE user_role (user_id UUID REFERENCES users(id) ON DELETE CASCADE, role_id UUID REFERENCES role(id), PRIMARY KEY (user_id, role_id) );
CREATE TABLE client (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(20), location_name VARCHAR(150), preferred_lang_code VARCHAR(5), created_at TIMESTAMPTZ DEFAULT NOW());
