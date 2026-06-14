-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('vegetarian', 'vegan', 'glutenFree', 'lactoseFree', 'spicy');

-- CreateEnum
CREATE TYPE "DishCategory" AS ENUM ('base', 'protein', 'proteinVeg', 'salad', 'side', 'dessert', 'beverage');

-- CreateEnum
CREATE TYPE "MealPeriod" AS ENUM ('breakfast', 'lunch', 'dinner');

-- CreateEnum
CREATE TYPE "ConfirmationType" AS ENUM ('standard', 'adapted');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('ok', 'low', 'critical');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('inbound', 'outbound', 'adjustment');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('critical', 'warning', 'info');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('criticalStock', 'lowStock', 'confirmationsPeak', 'other');

-- CreateEnum
CREATE TYPE "NotificationIcon" AS ENUM ('utensils', 'alert', 'bell', 'checkCircle', 'calendar');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enrollment" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "campus" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dietary_restrictions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "type" "DietaryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dietary_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "DishCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_restrictions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "dishId" UUID NOT NULL,
    "type" "DietaryType" NOT NULL,

    CONSTRAINT "dish_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "date" DATE NOT NULL,
    "period" "MealPeriod" NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_dishes" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "mealId" UUID NOT NULL,
    "dishId" UUID NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "meal_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmations" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "mealId" UUID NOT NULL,
    "type" "ConfirmationType" NOT NULL DEFAULT 'standard',
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_history" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period" "MealPeriod" NOT NULL,
    "dish" TEXT NOT NULL,
    "rating" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentQuantity" DECIMAL(12,3) NOT NULL,
    "minQuantity" DECIMAL(12,3) NOT NULL,
    "maxQuantity" DECIMAL(12,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "StockStatus" NOT NULL DEFAULT 'ok'::"StockStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "stockItemId" UUID NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "reason" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "level" "AlertLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "relatedId" UUID,
    "readByAdmins" UUID[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "icon" "NotificationIcon" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_analytics" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "date" DATE NOT NULL,
    "period" "MealPeriod" NOT NULL,
    "confirmationCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_enrollment_key" ON "users"("enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "dietary_restrictions_userId_type_key" ON "dietary_restrictions"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "dish_restrictions_dishId_type_key" ON "dish_restrictions"("dishId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "meals_date_period_key" ON "meals"("date", "period");

-- CreateIndex
CREATE UNIQUE INDEX "meal_dishes_mealId_dishId_key" ON "meal_dishes"("mealId", "dishId");

-- CreateIndex
CREATE UNIQUE INDEX "confirmations_userId_mealId_key" ON "confirmations"("userId", "mealId");

-- CreateIndex
CREATE INDEX "meal_history_userId_date_idx" ON "meal_history"("userId", "date");

-- CreateIndex
CREATE INDEX "stock_movements_stockItemId_createdAt_idx" ON "stock_movements"("stockItemId", "createdAt");

-- CreateIndex
CREATE INDEX "alerts_type_createdAt_idx" ON "alerts"("type", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "demand_analytics_date_period_key" ON "demand_analytics"("date", "period");

-- AddForeignKey
ALTER TABLE "dietary_restrictions" ADD CONSTRAINT "dietary_restrictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_restrictions" ADD CONSTRAINT "dish_restrictions_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_dishes" ADD CONSTRAINT "meal_dishes_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_dishes" ADD CONSTRAINT "meal_dishes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "confirmations_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_history" ADD CONSTRAINT "meal_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Constraints e automações que o Prisma Schema não expressa
-- ============================================================

-- meal_history.rating: avaliação de 1 a 5 (NULL enquanto não avaliado)
ALTER TABLE "meal_history"
  ADD CONSTRAINT "meal_history_rating_range"
  CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5));

-- meals.capacity: capacidade positiva
ALTER TABLE "meals"
  ADD CONSTRAINT "meals_capacity_positive"
  CHECK ("capacity" > 0);

-- meal_dishes.order: ordem de exibição não-negativa
ALTER TABLE "meal_dishes"
  ADD CONSTRAINT "meal_dishes_order_non_negative"
  CHECK ("order" >= 0);

-- stock_items: quantidades não-negativas e mínimo <= máximo
ALTER TABLE "stock_items"
  ADD CONSTRAINT "stock_items_quantities_non_negative"
  CHECK ("currentQuantity" >= 0 AND "minQuantity" >= 0 AND "maxQuantity" >= 0);
ALTER TABLE "stock_items"
  ADD CONSTRAINT "stock_items_min_le_max"
  CHECK ("minQuantity" <= "maxQuantity");

-- demand_analytics: período restrito a almoço/jantar (conforme issue)
ALTER TABLE "demand_analytics"
  ADD CONSTRAINT "demand_analytics_period_lunch_dinner"
  CHECK ("period" IN ('lunch', 'dinner'));

-- stock_items.status: calculado automaticamente a partir das quantidades.
-- Regra de negócio (ajustável): crit se atual <= mínimo; low se atual <= mínimo * 1.2; senão ok.
CREATE OR REPLACE FUNCTION set_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW."status" := CASE
    WHEN NEW."currentQuantity" <= NEW."minQuantity"        THEN 'critical'::"StockStatus"
    WHEN NEW."currentQuantity" <= NEW."minQuantity" * 1.2  THEN 'low'::"StockStatus"
    ELSE 'ok'::"StockStatus"
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_stock_status
  BEFORE INSERT OR UPDATE OF "currentQuantity", "minQuantity"
  ON "stock_items"
  FOR EACH ROW
  EXECUTE FUNCTION set_stock_status();
