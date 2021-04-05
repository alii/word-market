import {Command} from "../types/command";
import {Message} from "discord.js";
import {guilds} from "../inhibitors/guilds";
import {StandardEmbed} from "../structs/standard-embed";
import {generateMarket} from "../services/message";

const codeblock = (v: string) => `\`\`\`${v}\`\`\``;

const market: Command = {
  aliases: ["market"],
  description: "Get word usages since a time",
  inhibitors: [guilds],
  async run(message: Message): Promise<void> {
    const table = await generateMarket(message.guild!.id);

    const embed = new StandardEmbed(message.author).setTitle(
      `Total Words ${Object.values(table).length}`
    );

    embed.setDescription(codeblock(JSON.stringify(table, null, 4)));

    await message.channel.send(embed);
  },
};

export const words = [market] as const;
