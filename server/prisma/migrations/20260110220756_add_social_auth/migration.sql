-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "googleId" TEXT,
    "instagramId" TEXT,
    "twitterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_instagramId_key" ON "User"("instagramId");
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
