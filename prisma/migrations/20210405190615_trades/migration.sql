-- CreateEnum
CREATE TYPE "trade_type" AS ENUM ('Buy', 'Sell');

-- CreateTable
CREATE TABLE "Trades" (
    "id" TEXT NOT NULL,
    "type" "trade_type" NOT NULL,
    "word_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trades" ADD FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
