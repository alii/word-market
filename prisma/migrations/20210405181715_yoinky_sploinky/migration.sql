/*
  Warnings:

  - The migration will change the primary key for the `words` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `value` on the `words` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "words" DROP CONSTRAINT "words_pkey",
DROP COLUMN "value",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "words_id_seq";
