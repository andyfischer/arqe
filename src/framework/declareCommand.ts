
import { CommandDefinition } from '.'

export const everyCommand: { [name: string]: CommandDefinition } = {}

export default function declareCommand(def: CommandDefinition) {
    if (!def.name)
        throw new Error('missing definition.name');

    if (everyCommand[def.name])
        throw new Error('command already defined: ' + def.name);

    everyCommand[def.name] = def;
        
    return def;
}
