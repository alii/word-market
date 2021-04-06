import {Command} from "../types/command";
import {prisma} from "../services/prisma";
import {TradeType} from "@prisma/client";
import {guilds} from "../inhibitors/guilds";

const stupidInsert: Command = {
  inhibitors: [
    message => {
      if (message.author.id !== "268798547439255572") {
        throw new Error("Yuou are not alistair");
      }
    },
    guilds,
  ],
  description: "lol",
  aliases: ["lol"],
  async run(message, [wordName]) {
    const loadingMessage = await message.channel.send("loaidng");

    const word = await prisma.word.findFirst({
      where: {id: `${wordName}:${message.guild!.id}`},
    });

    if (!word) {
      throw new Error("Unknown word");
    }

    const tx = [...new Array(2_000_000_000)].map(() => {
      return prisma.trades.create({
        data: {
          price: 10,
          user_id: message.author.id,
          status: TradeType.BOUGHT,
          word_id: word.id,
        },
      });
    });

    await prisma.$transaction(tx);

    await loadingMessage.edit("LOL");
  },
};

export const admin = [stupidInsert] as const;
