import {Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {generateMarket} from "../services/message";
import {StandardEmbed} from "../structs/standard-embed";
import {Command} from "../types/command";

export const price: Command = {
  aliases: ["price"],
  description: "Get the price of a certain word",
  inhibitors: [guilds],
  async run(message: Message, [word]) {
    if (!word) {
      throw new Error(`Expected usage: "--lookup <word>"`);
    }
    const market = await generateMarket(message.guild!.id);
    const price = market[word];
    const embed = new StandardEmbed(message.author).setTitle(
      price
        ? `The price of "${word}" is $${price}`
        : `The word "${word}" has never been said before.`
    );

    await message.channel.send(embed);
  },
};

export const lookup = [price] as const;
