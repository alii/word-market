-- CreateTable
CREATE TABLE "User" (
    "discord_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 10,

    PRIMARY KEY ("discord_id")
);

-- AddForeignKey
ALTER TABLE "Trades" ADD FOREIGN KEY ("user_id") REFERENCES "User"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;
