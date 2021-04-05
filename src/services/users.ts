import {wrapRedis} from "./redis";
import {prisma} from "./prisma";
import {User} from "@prisma/client";

export function resolveUser(id: string): Promise<User> {
  return wrapRedis(`user:${id}`, async () => {
    const existing = await prisma.user.findFirst({
      where: {discord_id: id},
    });

    if (existing) {
      return existing;
    }

    return prisma.user.create({
      data: {discord_id: id},
    });
  });
}
