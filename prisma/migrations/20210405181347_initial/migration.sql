-- CreateTable
CREATE TABLE "servers" (
    "guild_id" TEXT NOT NULL,

    PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "server_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "words" ADD FOREIGN KEY ("server_id") REFERENCES "servers"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
