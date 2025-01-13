/*
  Warnings:

  - You are about to drop the column `userId` on the `Textbook` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_TextbookToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TextbookToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Textbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TextbookToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Textbook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Textbook_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Textbook" ("author", "courseId", "createdAt", "id", "level", "title", "updatedAt", "url") SELECT "author", "courseId", "createdAt", "id", "level", "title", "updatedAt", "url" FROM "Textbook";
DROP TABLE "Textbook";
ALTER TABLE "new_Textbook" RENAME TO "Textbook";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_TextbookToUser_AB_unique" ON "_TextbookToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TextbookToUser_B_index" ON "_TextbookToUser"("B");
