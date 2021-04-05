/*
  Warnings:

  - The values [Buy,Sell] on the enum `trade_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "trade_type_new" AS ENUM ('BOUGHT', 'SOLD');
ALTER TABLE "Trades" ALTER COLUMN "status" TYPE "trade_type_new" USING ("status"::text::"trade_type_new");
ALTER TYPE "trade_type" RENAME TO "trade_type_old";
ALTER TYPE "trade_type_new" RENAME TO "trade_type";
DROP TYPE "trade_type_old";
COMMIT;
