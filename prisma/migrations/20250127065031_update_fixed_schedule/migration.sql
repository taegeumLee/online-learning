/*
  Warnings:

  - You are about to drop the column `endAt` on the `FixedSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `FixedSchedule` table. All the data in the column will be lost.
  - Added the required column `endHour` to the `FixedSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endMinute` to the `FixedSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startHour` to the `FixedSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMinute` to the `FixedSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FixedSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "userId" TEXT,
    CONSTRAINT "FixedSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FixedSchedule" ("dayOfWeek", "id", "userId") SELECT "dayOfWeek", "id", "userId" FROM "FixedSchedule";
DROP TABLE "FixedSchedule";
ALTER TABLE "new_FixedSchedule" RENAME TO "FixedSchedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
