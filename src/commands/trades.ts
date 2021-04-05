import {Command} from "../types/command";
import {EmbedField, Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {StandardEmbed} from "../structs/standard-embed";
import {generateMarket} from "../services/message";
import {prisma} from "../services/prisma";
import {Prisma, TradeType, User, Trades} from "@prisma/client";
import {resolveUser} from "../services/users";
import {redis} from "../services/redis";

type ClientType = Prisma.Prisma__UserClient<User> | Prisma.Prisma__TradesClient<Trades>;

const list: Command = {
  aliases: ["list"],
  description: "List all your trades",
  inhibitors: [guilds],
  async run(message) {
    const trades = await prisma.trades.findMany({
      where: {
        user_id: message.author.id,
        status: TradeType.BOUGHT,
      },
      include: {
        word: true,
      },
    });

    const embed = new StandardEmbed(message.author);

    if (trades.length === 0) {
      embed.setDescription("You have no purchases!");
    } else {
      const fields = trades.map(
        (trade): EmbedField => {
          return {
            name: trade.id,
            value: `Status: ${trade.status}\nWord: ${
              trade.word.id.split(":")[0]
            }\nPurchase Price: ${trade.price}`,
            inline: true,
          };
        }
      );

      embed.addFields(fields);
    }

    await message.channel.send(embed);
  },
};

const sellAll: Command = {
  aliases: ["sellall"],
  description: "Sell all of a word",
  inhibitors: [guilds],
  async run(message, [word]) {
    const trades = await prisma.trades.findMany({
      where: {
        word_id: `${word}:${message.guild!.id}`,
      },
      include: {
        word: true,
      },
    });

    const user = await resolveUser(message.author.id);

    const market = await generateMarket(message.guild!.id);

    const tx = trades.reduce((all, trade) => {
      const marketPrice = market[trade.word.id.split(":")[0]];

      const balance = user.balance + (marketPrice - trade.price);

      return [
        ...all,
        prisma.user.update({
          where: {discord_id: user.discord_id},
          data: {balance},
        }),
        prisma.trades.update({
          where: {id: trade.id},
          data: {status: TradeType.SOLD},
        }),
      ];
    }, [] as ClientType[]);

    await redis.del(`user:${message.author.id}`);
    await prisma.$transaction(tx);

    await message.channel.send("cheers sold");
  },
};

const sell: Command = {
  aliases: ["sell"],
  description: "Sell a word",
  inhibitors: [guilds],
  async run(message, [id]) {
    const trade = await prisma.trades.findFirst({
      where: {
        AND: [{user_id: message.author.id}, {id}],
      },
      include: {
        word: true,
      },
    });

    if (!trade) {
      throw new Error("Unknown trade, or you do not have permission to sell it");
    }

    const market = await generateMarket(message.guild!.id);

    const marketPrice = market[trade.word.id.split(":")[0]];

    const user = await resolveUser(message.author.id);

    const balance = user.balance + (marketPrice - trade.price);

    await prisma.trades.update({
      where: {id: trade.id},
      data: {status: TradeType.SOLD},
    });

    await prisma.user.update({
      where: {
        discord_id: message.author.id,
      },
      data: {balance},
    });

    await message.channel.send("cheers");
  },
};

const buy: Command = {
  aliases: ["buy"],
  description: "Buy into a certain word at it's current percentage share",
  inhibitors: [guilds],
  async run(message: Message, [word]: string[]) {
    const market = await generateMarket(message.guild!.id);

    const price = market[word];

    if (price === undefined) {
      throw new Error("Unknown word (or has not been sent yet)");
    }

    const wordModel = await prisma.word.findFirst({
      where: {
        id: `${word}:${message.guild!.id}`,
      },
    });

    if (!wordModel) {
      throw new Error("Unknown word (or has not been sent yet)");
    }

    const user = await resolveUser(message.author.id);

    if (price >= user.balance) {
      throw new Error("Insufficient funds");
    }

    await prisma.trades.create({
      data: {
        status: TradeType.BOUGHT,
        word_id: wordModel.id,
        user_id: message.author.id,
        price,
      },
    });

    await prisma.user.update({
      where: {discord_id: message.author.id},
      data: {
        balance: user.balance - price,
      },
    });

    await redis.del(`user:${message.author.id}`);

    await message.channel.send(
      new StandardEmbed(message.author).setTitle(`Purchase Success for ${price}`)
    );
  },
};

export const trades = [buy, sell, list, sellAll] as const;
