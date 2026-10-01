CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    "avatarUrl" VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'CHURCH_MEMBER',
    "googleId" VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'CHURCH_MEMBER'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users("googleId");

-- Seed default admin user for initial testing
INSERT INTO users (email, name, "avatarUrl", role)
VALUES ('admin@church.org', 'Admin User', NULL, 'ADMIN')
ON CONFLICT (email) DO NOTHING;
