CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code VARCHAR(50) NOT NULL UNIQUE,
    family_name VARCHAR(150) NOT NULL,
    residential_address TEXT,
    office_address TEXT,
    area VARCHAR(100),
    subscription_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    member_no VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    gender VARCHAR(20),
    marital_status VARCHAR(30),
    date_of_birth DATE,
    date_of_baptism DATE,
    date_of_confirmation DATE,
    date_of_marriage DATE,
    blood_group VARCHAR(10),
    profession VARCHAR(120),
    mobile_no VARCHAR(30),
    aadhaar_number VARCHAR(20),
    email VARCHAR(120),
    relationship_type VARCHAR(50),
    is_head BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT persons_family_id_fkey
        FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_persons_family_id ON persons(family_id);
CREATE INDEX IF NOT EXISTS idx_persons_mobile_no ON persons(mobile_no);
CREATE UNIQUE INDEX IF NOT EXISTS uk_persons_aadhaar_number
    ON persons(aadhaar_number) WHERE aadhaar_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_families_family_code ON families(family_code);

CREATE TABLE IF NOT EXISTS financial_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_label VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'LIVE',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_events_status CHECK (status IN ('LIVE', 'CLOSED'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    financial_year_id UUID NOT NULL,
    santha_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ministry_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    main_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    last_saved_at TIMESTAMP,
    CONSTRAINT subscriptions_family_id_fkey
        FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_financial_year_id_fkey
        FOREIGN KEY (financial_year_id) REFERENCES financial_years (id) ON DELETE CASCADE,
    CONSTRAINT uk_subscriptions_family_year UNIQUE (family_id, financial_year_id),
    CONSTRAINT chk_subscriptions_status CHECK (status IN ('DRAFT', 'SUBMITTED'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    financial_year_id UUID NOT NULL,
    event_id UUID,
    month INTEGER,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_financial_year_id_fkey
        FOREIGN KEY (financial_year_id) REFERENCES financial_years (id),
    CONSTRAINT transactions_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT chk_transactions_type CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT chk_transactions_category CHECK (category IN ('SANATHA', 'MINISTRY', 'EVENT', 'GENERAL'))
);

CREATE TABLE IF NOT EXISTS event_audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_audit_items_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT chk_event_audit_type CHECK (type IN ('DECISION', 'PURCHASE', 'INCOME', 'EXPENSE'))
);

CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS magazines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_family_id ON subscriptions(family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_financial_year_id ON subscriptions(financial_year_id);
CREATE INDEX IF NOT EXISTS idx_transactions_financial_year_id ON transactions(financial_year_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_audit_items_event_id ON event_audit_items(event_id);

CREATE OR REPLACE FUNCTION search_records(
    p_family_id UUID DEFAULT NULL,
    p_subscription_id VARCHAR DEFAULT NULL,
    p_member_name VARCHAR DEFAULT NULL,
    p_phone_number VARCHAR DEFAULT NULL,
    p_aadhaar_number VARCHAR DEFAULT NULL
)
RETURNS TABLE(family_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT f.id
    FROM families f
    LEFT JOIN persons p ON p.family_id = f.id
    WHERE (p_family_id IS NULL OR f.id = p_family_id)
      AND (p_subscription_id IS NULL OR lower(coalesce(f.subscription_id, '')) LIKE '%' || lower(p_subscription_id) || '%')
      AND (p_member_name IS NULL OR lower(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) LIKE '%' || lower(p_member_name) || '%')
      AND (p_phone_number IS NULL OR lower(coalesce(p.mobile_no, '')) LIKE '%' || lower(p_phone_number) || '%')
      AND (p_aadhaar_number IS NULL OR lower(coalesce(p.aadhaar_number, '')) = lower(p_aadhaar_number));
END;
$$;
