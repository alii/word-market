import {Command} from "../types/command";

import {util} from "./util";
import {words} from "./words";
import {trades} from "./trades";

export const commands: Command[] = [util, ...words, ...trades];

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
