/*
  Warnings:

  - You are about to alter the column `paymentDate` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 2000000,
    "paymentDate" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'user',
    "teacherId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "recentTextbookId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isActive", "name", "password", "paymentDate", "price", "recentTextbookId", "role", "teacherId", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "password", "paymentDate", "price", "recentTextbookId", "role", "teacherId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
