/*
  Warnings:

  - You are about to drop the column `type` on the `Trades` table. All the data in the column will be lost.
  - Added the required column `status` to the `Trades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Trades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trades" DROP COLUMN "type",
ADD COLUMN     "status" "trade_type" NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;
