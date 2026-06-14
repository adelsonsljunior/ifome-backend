-- AlterTable
ALTER TABLE "stock_items" ALTER COLUMN "status" SET DEFAULT 'ok'::"StockStatus";

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
