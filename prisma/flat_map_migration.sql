-- ======================================================
-- Flat Map Migration SQL
-- Run this in Supabase Dashboard → SQL Editor
-- (Project: bpwdtykwsopaupxosowf)
-- ======================================================

-- 1. FlatType table
CREATE TABLE IF NOT EXISTS "flat_types" (
    "id"                  TEXT NOT NULL,
    "site_id"             TEXT NOT NULL,
    "name"                TEXT NOT NULL,
    "default_carpet_area" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "default_loading_pct" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "color_tag"           TEXT,
    "is_system_default"   BOOLEAN NOT NULL DEFAULT false,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "flat_types_pkey" PRIMARY KEY ("id")
);

-- 2. Block table
CREATE TABLE IF NOT EXISTS "blocks" (
    "id"               TEXT NOT NULL,
    "site_id"          TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "default_category" TEXT NOT NULL DEFAULT 'new',
    "rate_new"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate_redev"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sort_index"       INTEGER NOT NULL DEFAULT 0,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- 3. Floor table
CREATE TABLE IF NOT EXISTS "floors" (
    "id"         TEXT NOT NULL,
    "block_id"   TEXT NOT NULL,
    "label"      TEXT NOT NULL,
    "sort_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- 4. Flat table
CREATE TABLE IF NOT EXISTS "flats" (
    "id"                   TEXT NOT NULL,
    "floor_id"             TEXT NOT NULL,
    "flat_type_id"         TEXT,
    "no"                   TEXT NOT NULL,
    "category"             TEXT NOT NULL DEFAULT 'new',
    "status"               TEXT NOT NULL DEFAULT 'unsold',
    "carpet_area"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "loading_pct"          DOUBLE PRECISION NOT NULL DEFAULT 20,
    "sale_area"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sale_area_overridden" BOOLEAN NOT NULL DEFAULT false,
    "facing"               TEXT,
    "notes"                TEXT,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "flats_pkey" PRIMARY KEY ("id")
);

-- 5. Unique constraints
ALTER TABLE "flat_types" ADD CONSTRAINT "flat_types_site_id_name_key" UNIQUE ("site_id", "name");

-- 6. Foreign keys
ALTER TABLE "flat_types" ADD CONSTRAINT "flat_types_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "blocks" ADD CONSTRAINT "blocks_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "floors" ADD CONSTRAINT "floors_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "flats" ADD CONSTRAINT "flats_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "flats" ADD CONSTRAINT "flats_flat_type_id_fkey" FOREIGN KEY ("flat_type_id") REFERENCES "flat_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
