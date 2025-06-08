/*
  Warnings:

  - You are about to drop the column `toAccoun` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `smsBody` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "toAccoun",
ADD COLUMN     "smsBody" TEXT NOT NULL,
ADD COLUMN     "toAccount" TEXT;
