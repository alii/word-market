import {Command} from "../types/command";
import {EmbedField, Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {StandardEmbed} from "../structs/standard-embed";
import {prisma} from "../services/prisma";

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

    const embed = new StandardEmbed(message.author).setTitle(`Top 10 words`);

    const fields = rows.map(
      (word): EmbedField => {
        return {
          name: word.id.split(":")[0],
          value: `$${word.count}`,
          inline: true,
        };
      }
    );

    embed.addFields(fields);

    await message.channel.send(embed);
  },
};

export const words = [market] as const;
