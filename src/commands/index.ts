import {Command} from "../types/command";

import {ping} from "./util/ping";
import {words} from "./words";

export const commands: Command[] = [ping, ...words];

const commandsWithAliases = commands.reduce((all, command) => {
  return command.aliases.reduce((previous, commandName) => {
    return {...previous, [commandName]: command};
  }, all);
}, {} as Record<string, Command>);

export const aliases = new Map<string, Command>(Object.entries(commandsWithAliases));

const allCommandAliases = commands.map(c => c.aliases).flat();
const duplicateAliases = allCommandAliases.filter((c, i, a) => a.indexOf(c) !== i);

if (duplicateAliases.length > 0) {
  throw new Error(`Encountered duplicate aliases: ${duplicateAliases.join(", ")}`);
}
