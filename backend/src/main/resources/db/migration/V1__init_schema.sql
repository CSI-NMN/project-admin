-- Prerequisite (run once before starting the backend):
-- CREATE DATABASE churchdb;
-- Flyway migrations run only after connecting to the target database.

CREATE TABLE IF NOT EXISTS families (
    id BIGSERIAL PRIMARY KEY,
    "familyCode" VARCHAR(50) NOT NULL UNIQUE,
    "familyName" VARCHAR(150) NOT NULL,
    "address1" VARCHAR(200),
    "area" VARCHAR(100),
    "address2" VARCHAR(200),
    "pincode" VARCHAR(20),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "familyHeadId" BIGINT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships (
    id BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS persons (
    id BIGSERIAL PRIMARY KEY,
    "familyId" BIGINT NOT NULL,
    "memberNo" BIGINT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "gender" VARCHAR(20),
    "maritalStatus" VARCHAR(30),
    "dateOfBirth" DATE,
    "dateOfBaptism" DATE,
    "dateOfConfirmation" DATE,
    "dateOfMarriage" DATE,
    "bloodGroup" VARCHAR(10),
    "profession" VARCHAR(120),
    "mobileNo" VARCHAR(30),
    "aadhaarNumber" VARCHAR(20),
    "email" VARCHAR(120),
    "relationshipType" VARCHAR(50),
    "isHead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT persons_family_id_fkey
        FOREIGN KEY ("familyId") REFERENCES families (id) ON DELETE CASCADE,
    CONSTRAINT persons_member_no_fkey
        FOREIGN KEY ("memberNo") REFERENCES memberships (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_persons_family_id ON persons("familyId");
CREATE INDEX IF NOT EXISTS idx_persons_member_no ON persons("memberNo");
CREATE INDEX IF NOT EXISTS idx_persons_mobile_no ON persons("mobileNo");
CREATE UNIQUE INDEX IF NOT EXISTS uk_persons_aadhaar_number
    ON persons("aadhaarNumber") WHERE "aadhaarNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_memberships_name ON memberships("name");
CREATE INDEX IF NOT EXISTS idx_families_family_code ON families("familyCode");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'families_family_head_id_fkey'
    ) THEN
        ALTER TABLE families
            ADD CONSTRAINT families_family_head_id_fkey
            FOREIGN KEY ("familyHeadId") REFERENCES persons (id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS financial_years (
    id BIGSERIAL PRIMARY KEY,
    "yearLabel" VARCHAR(20) NOT NULL UNIQUE,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'LIVE',
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_events_status CHECK ("status" IN ('LIVE', 'CLOSED'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    "familyId" BIGINT NOT NULL,
    "financialYearId" BIGINT NOT NULL,
    "santhaAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "ministryAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "mainAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "totalAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "lastSavedAt" TIMESTAMP,
    CONSTRAINT subscriptions_family_id_fkey
        FOREIGN KEY ("familyId") REFERENCES families (id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_financial_year_id_fkey
        FOREIGN KEY ("financialYearId") REFERENCES financial_years (id) ON DELETE CASCADE,
    CONSTRAINT uk_subscriptions_family_year UNIQUE ("familyId", "financialYearId"),
    CONSTRAINT chk_subscriptions_status CHECK ("status" IN ('DRAFT', 'SUBMITTED'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    "type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "amount" NUMERIC(12,2) NOT NULL,
    "financialYearId" BIGINT NOT NULL,
    "eventId" BIGINT,
    "month" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_financial_year_id_fkey
        FOREIGN KEY ("financialYearId") REFERENCES financial_years (id),
    CONSTRAINT transactions_event_id_fkey
        FOREIGN KEY ("eventId") REFERENCES events (id),
    CONSTRAINT chk_transactions_type CHECK ("type" IN ('INCOME', 'EXPENSE')),
    CONSTRAINT chk_transactions_category CHECK ("category" IN ('SANATHA', 'MINISTRY', 'EVENT', 'GENERAL'))
);

CREATE TABLE IF NOT EXISTS event_audit_items (
    id BIGSERIAL PRIMARY KEY,
    "eventId" BIGINT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" NUMERIC(12,2),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_audit_items_event_id_fkey
        FOREIGN KEY ("eventId") REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT chk_event_audit_type CHECK ("type" IN ('DECISION', 'PURCHASE', 'INCOME', 'EXPENSE'))
);

CREATE TABLE IF NOT EXISTS blogs (
    id BIGSERIAL PRIMARY KEY,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS magazines (
    id BIGSERIAL PRIMARY KEY,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_family_id ON subscriptions("familyId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_financial_year_id ON subscriptions("financialYearId");
CREATE INDEX IF NOT EXISTS idx_transactions_financial_year_id ON transactions("financialYearId");
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions("eventId");
CREATE INDEX IF NOT EXISTS idx_event_audit_items_event_id ON event_audit_items("eventId");

CREATE OR REPLACE FUNCTION search_records(
    p_familyId BIGINT DEFAULT NULL,
    p_familyHeadId BIGINT DEFAULT NULL,
    p_memberName VARCHAR DEFAULT NULL,
    p_phoneNumber VARCHAR DEFAULT NULL,
    p_aadhaarNumber VARCHAR DEFAULT NULL
)
RETURNS TABLE("familyId" BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT f.id
    FROM families f
    LEFT JOIN persons p ON p."familyId" = f.id
    WHERE (p_familyId IS NULL OR f.id = p_familyId)
      AND (p_familyHeadId IS NULL OR f."familyHeadId" = p_familyHeadId)
      AND (p_memberName IS NULL OR lower(coalesce(p."firstName", '') || ' ' || coalesce(p."lastName", '')) LIKE '%' || lower(p_memberName) || '%')
      AND (p_phoneNumber IS NULL OR lower(coalesce(p."mobileNo", '')) LIKE '%' || lower(p_phoneNumber) || '%')
      AND (p_aadhaarNumber IS NULL OR lower(coalesce(p."aadhaarNumber", '')) = lower(p_aadhaarNumber));
END;
$$;
