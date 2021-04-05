import {Command} from "../types/command";
import {StandardEmbed} from "../structs/standard-embed";

export const util: Command = {
  aliases: ["ping", "pi"],
  description: "Checks that the bot is online",
  inhibitors: [],
  async run(message) {
    const start = Date.now();
    const m = await message.channel.send(new StandardEmbed(message.author).setTitle("Pong!"));
    const end = Date.now() - start;

    await m.edit(new StandardEmbed(message.author).setTitle(`Pong! API Latency ${end}ms`));
  },
};
