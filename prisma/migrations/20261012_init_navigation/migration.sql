-- CreateEnum
CREATE TYPE "NavigationItemType" AS ENUM ('GROUP', 'LINK', 'EXTERNAL_LINK', 'DIVIDER');

-- CreateTable: navigation_menus
CREATE TABLE "navigation_menus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "tenantId" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "navigation_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable: navigation_menu_items
CREATE TABLE "navigation_menu_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "menuId" UUID NOT NULL,
    "parentId" UUID,
    "key" VARCHAR(150) NOT NULL,
    "type" "NavigationItemType" NOT NULL DEFAULT 'LINK',
    "label" VARCHAR(200) NOT NULL,
    "path" VARCHAR(500),
    "icon" VARCHAR(100),
    "permission" VARCHAR(200),
    "moduleKey" VARCHAR(100),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "navigation_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: navigation_translations
CREATE TABLE "navigation_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "itemId" UUID NOT NULL,
    "locale" VARCHAR(20) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),

    CONSTRAINT "navigation_translations_pkey" PRIMARY KEY ("id")
);

-- Unique and Performance Indexes
CREATE UNIQUE INDEX "navigation_menus_key_key" ON "navigation_menus"("key");
CREATE INDEX "navigation_menus_isActive_idx" ON "navigation_menus"("isActive");
CREATE INDEX "navigation_menus_tenantId_idx" ON "navigation_menus"("tenantId");

CREATE UNIQUE INDEX "navigation_menu_items_menuId_key_key" ON "navigation_menu_items"("menuId", "key");
CREATE INDEX "navigation_menu_items_menuId_parentId_sortOrder_idx" ON "navigation_menu_items"("menuId", "parentId", "sortOrder");
CREATE INDEX "navigation_menu_items_permission_idx" ON "navigation_menu_items"("permission");
CREATE INDEX "navigation_menu_items_moduleKey_idx" ON "navigation_menu_items"("moduleKey");

CREATE UNIQUE INDEX "navigation_translations_itemId_locale_key" ON "navigation_translations"("itemId", "locale");
CREATE INDEX "navigation_translations_locale_idx" ON "navigation_translations"("locale");

-- Foreign Key Constraints
ALTER TABLE "navigation_menu_items"
    ADD CONSTRAINT "navigation_menu_items_menuId_fkey"
    FOREIGN KEY ("menuId") REFERENCES "navigation_menus"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "navigation_menu_items"
    ADD CONSTRAINT "navigation_menu_items_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "navigation_menu_items"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "navigation_translations"
    ADD CONSTRAINT "navigation_translations_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "navigation_menu_items"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Business Safeguard: Database-level check constraint for route vs item type
-- GROUP and DIVIDER items must have no route (path IS NULL)
-- LINK and EXTERNAL_LINK must have a valid route (path IS NOT NULL)
ALTER TABLE "navigation_menu_items"
    ADD CONSTRAINT "chk_nav_item_type_route"
    CHECK (
        (type IN ('GROUP', 'DIVIDER') AND (path IS NULL OR length(trim(path)) = 0))
        OR
        (type IN ('LINK', 'EXTERNAL_LINK') AND path IS NOT NULL AND length(trim(path)) > 0)
    );

-- Business Safeguard: Prevent direct self-parenting at the database level
ALTER TABLE "navigation_menu_items"
    ADD CONSTRAINT "chk_nav_item_no_self_parent"
    CHECK ("id" <> "parentId");
