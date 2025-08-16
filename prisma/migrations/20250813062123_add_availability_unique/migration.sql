/*
  Warnings:

  - A unique constraint covering the columns `[listingId,date]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_listingId_date_key" ON "public"."Availability"("listingId", "date");
