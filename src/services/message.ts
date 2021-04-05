import {Prisma, Word} from "@prisma/client";
import {Message} from "discord.js";
import {prisma} from "./prisma";
import {redis, wrapRedis} from "./redis";

/**
 * The default expiry for ratelimited words in seconds
 */
const RATELIMIT_TTL = 60;

export async function registerMessage(message: Message): Promise<void> {
  if (!message.guild) {
    return;
  }

  const server_id = message.guild.id;

  await wrapRedis(`server:${server_id}`, async () => {
    const existingEntities = await prisma.server.findFirst({
      where: {guild_id: server_id},
    });

    if (existingEntities) {
      return existingEntities;
    }

    return prisma.server.create({
      data: {
        guild_id: server_id,
      },
    });
  });

  const words = [
    ...new Set(
      await Promise.all(
        message.content.split(" ").map(async item => {
          if (item.trim() === "") return null;

          const isRatelimited = await redis.get(`word-ratelimit:${item}`);

          if (isRatelimited) {
            return null;
          }

          return item
            .trim()
            .toLowerCase()
            .replace(/[^0-9a-z]/gi, "");
        })
      )
    ),
  ];

  const tx = words.reduce((all, word) => {
    if (!word) return all;

    void redis.set(`word-ratelimit:${word}`, "yes", "ex", RATELIMIT_TTL);

    const operation = prisma.word.upsert({
      where: {id: `${word}:${server_id}`},
      create: {id: `${word}:${server_id}`, server_id},
      update: {
        count: {increment: 1},
      },
    });

    return [...all, operation];
  }, [] as Prisma.Prisma__WordClient<Word>[]);

  await prisma.$transaction(tx);
}

export async function generateMarket(server_id: string): Promise<Record<string, number>> {
  const words = await wrapRedis(`words:${server_id}`, () => {
    return prisma.word.findMany({
      where: {server_id},
    });
  });

  return wrapRedis("market", () => {
    const total = words.reduce((all, word) => {
      return word.count + all;
    }, 0);

    const map: Record<string, number> = {};

    for (const word of words) {
      const [value] = word.id.split(":");
      map[value] = Math.floor((word.count / total) * 100);
    }

    return map;
  });
}
