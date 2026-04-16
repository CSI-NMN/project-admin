ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS "personId" BIGINT,
    ADD COLUMN IF NOT EXISTS "cardPayload" TEXT NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE subscriptions
    DROP CONSTRAINT IF EXISTS uk_subscriptions_family_year;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscriptions_person_id_fkey'
    ) THEN
        ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_person_id_fkey
            FOREIGN KEY ("personId") REFERENCES persons (id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_subscriptions_person_year
    ON subscriptions("personId", "financialYearId")
    WHERE "personId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_person_id
    ON subscriptions("personId");
