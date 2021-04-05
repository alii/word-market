import {Command} from "../types/command";
import {Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {StandardEmbed} from "../structs/standard-embed";
import {generateMarket} from "../services/message";
import {prisma} from "../services/prisma";
import {TradeType} from "@prisma/client";

export const buy: Command = {
  aliases: ["buy"],
  description: "Buy into a certain word at it's current percentage share",
  inhibitors: [guilds],
  async run(message: Message, [word]: string[]) {
    const market = await generateMarket(message.guild!.id);

    const price = market[word];

    if (!price) {
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

    await prisma.trades.create({
      data: {
        status: TradeType.Buy,
        word_id: wordModel.id,
        user_id: message.author.id,
        price,
      },
    });

    await message.channel.send(
      new StandardEmbed(message.author).setTitle(`Purchase Success for ${price}`)
    );
  },
};

export const trades = [buy] as const;