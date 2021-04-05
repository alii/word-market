import {Command} from "../types/command";
import {resolveUser} from "../services/users";
import {StandardEmbed} from "../structs/standard-embed";
import {prisma} from "../services/prisma";
import {redis} from "../services/redis";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const bal: Command = {
  description: "Checks your balance",
  aliases: ["bal", "balance"],
  inhibitors: [],
  async run(message): Promise<void> {
    const user = await resolveUser(message.author.id);

    const embed = new StandardEmbed(message.author).setTitle(`You have $${user.balance}.`);

    await message.channel.send(embed);
  },
};

export const daily: Command = {
  aliases: ["daily", "claim"],
  description: "Claim $200 every day",
  inhibitors: [],
  async run(message) {
    const hasUsedToday = await redis.get(`daily:${message.author.id}`);

    if (hasUsedToday) {
      throw new Error("You have already claimed your daily cash.");
    }

    const user = await resolveUser(message.author.id);

    await prisma.user.update({
      where: {discord_id: user.discord_id},
      data: {
        balance: {increment: 200},
      },
    });

    await redis.set(`daily:${message.author.id}`, "yes", "ex", ONE_DAY_IN_SECONDS);
    await redis.del(`user:${message.author.id}`);

    await message.channel.send("You have claimed $200.");
  },
};

export const pay: Command = {
  aliases: ["pay"],
  description: "Pay another user some balance",
  inhibitors: [],
  async run(message, args): Promise<void> {
    const user = message.mentions.users.first()?.id ?? args[0];

    if (!user) {
      throw new Error("You must choose a user");
    }

    const value = parseInt(args[1]);

    if (!value) {
      throw new Error("You must specify a price");
    }

    const from = await resolveUser(message.author.id);

    if (value >= from.balance) {
      throw new Error(
        `You do not have enough funds to pay this much! You have ${from.balance}. (You need ${
          value - from.balance
        } more)`
      );
    }

    const to = await resolveUser(user);

    const tx = [
      prisma.user.update({
        where: {discord_id: to.discord_id},
        data: {balance: {increment: value}},
      }),
      prisma.user.update({
        where: {discord_id: from.discord_id},
        data: {balance: {decrement: value}},
      }),
    ];

    await prisma.$transaction(tx);

    await redis.del(`user:${from.discord_id}`);
    await redis.del(`user:${to.discord_id}`);

    await message.channel.send(
      new StandardEmbed(message.author).setDescription(`Paid ${value} to <@${to.discord_id}>`)
    );
  },
};

export const users = [bal, pay, daily] as const;
