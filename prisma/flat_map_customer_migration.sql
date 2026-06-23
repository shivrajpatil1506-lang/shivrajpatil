-- Add customer_id column to flats table
ALTER TABLE "flats" ADD COLUMN "customer_id" TEXT;

-- Add foreign key constraint
ALTER TABLE "flats" ADD CONSTRAINT "flats_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
