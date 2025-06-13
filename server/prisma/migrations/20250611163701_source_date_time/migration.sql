/*
  Warnings:

  - Added the required column `sourceDateTime` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "sourceDateTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" DROP NOT NULL;
