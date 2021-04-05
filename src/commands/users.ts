import {Command} from "../types/command";
import {resolveUser} from "../services/users";
import {StandardEmbed} from "../structs/standard-embed";

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

export const users = [bal] as const;
