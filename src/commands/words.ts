import {Command} from "../types/command";
import {EmbedField, Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {StandardEmbed} from "../structs/standard-embed";
import {prisma} from "../services/prisma";
import {generateMarket} from "../services/message";

const market: Command = {
  aliases: ["market"],
  description: "Get word usages since a time",
  inhibitors: [guilds],
  async run(message: Message): Promise<void> {
    const rows = await prisma.word.findMany({
      where: {server_id: message.guild!.id},
      take: 25,
      orderBy: {
        count: "desc",
      },
    });

    const market = await generateMarket(message.guild!.id);

    const embed = new StandardEmbed(message.author).setTitle(`Top 10 words`);

    const fields = rows.map(
      (word): EmbedField => {
        const name = word.id.split(":")[0];

        return {
          name,
          value: `$${market[name]}`,
          inline: false,
        };
      }
    );

    embed.addFields(fields);

    await message.channel.send(embed);
  },
};

export const words = [market] as const;
