-- ============================================================
-- Migration: 003_org_setup.sql
-- Description: Creates departments, asset_categories,
--              activity_logs, and notifications tables
-- Run this manually against your Neon PostgreSQL database.
-- ============================================================

-- --------------------------------
-- DEPARTMENTS
-- --------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(150) NOT NULL,
  description           TEXT,
  parent_department_id  INT REFERENCES departments(id) ON DELETE RESTRICT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_by            INT NOT NULL REFERENCES users(id),
  updated_by            INT REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent a department from being its own parent at the DB level
  CONSTRAINT chk_no_self_parent CHECK (id <> parent_department_id)
);

-- Case-insensitive unique index on department name
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_name_lower
  ON departments (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_departments_parent
  ON departments (parent_department_id);

-- --------------------------------
-- ASSET CATEGORIES
-- --------------------------------
CREATE TABLE IF NOT EXISTS asset_categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  INT NOT NULL REFERENCES users(id),
  updated_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique index on category name
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_categories_name_lower
  ON asset_categories (LOWER(name));

-- --------------------------------
-- ACTIVITY LOGS
-- --------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,   -- e.g. 'DEPARTMENT_CREATED'
  entity      VARCHAR(100) NOT NULL,   -- e.g. 'department'
  entity_id   INT NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
  ON activity_logs (entity, entity_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user
  ON activity_logs (user_id);

-- --------------------------------
-- NOTIFICATIONS
-- --------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id),   -- recipient
  message     TEXT NOT NULL,
  type        VARCHAR(100),
  entity      VARCHAR(100),
  entity_id   INT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, is_read);

-- --------------------------------
-- ASSETS TABLE (if not already created)
-- Minimal definition needed by deactivation checks.
-- Skip if your assets table already exists.
-- --------------------------------
CREATE TABLE IF NOT EXISTS assets (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  category_id   INT REFERENCES asset_categories(id),
  department_id INT REFERENCES departments(id),
  status        VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------
-- ASSET ALLOCATIONS (if not already created)
-- --------------------------------
CREATE TABLE IF NOT EXISTS asset_allocations (
  id          SERIAL PRIMARY KEY,
  asset_id    INT NOT NULL REFERENCES assets(id),
  user_id     INT NOT NULL REFERENCES users(id),
  status      VARCHAR(50) NOT NULL DEFAULT 'active',
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at  TIMESTAMPTZ
);

-- --------------------------------
-- ASSET BOOKINGS (if not already created)
-- --------------------------------
CREATE TABLE IF NOT EXISTS asset_bookings (
  id          SERIAL PRIMARY KEY,
  asset_id    INT NOT NULL REFERENCES assets(id),
  user_id     INT NOT NULL REFERENCES users(id),
  status      VARCHAR(50) NOT NULL DEFAULT 'active',
  booked_from TIMESTAMPTZ NOT NULL,
  booked_to   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
