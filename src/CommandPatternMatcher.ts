import TuplePatternMatcher from "./TuplePatternMatcher"
import parseCommand from "./parseCommand"
import AutoInitMap from "./utils/AutoInitMap"
import Tuple from "./Tuple"
import { patternTagToString } from "./stringifyQuery"

interface CommandEntry<T> {
    inputPattern: Tuple
    value: T
}

class SingleCommandMatches<T> {
    entries: CommandEntry<T>[] = []

    add(inputPattern: Tuple, value: T) {
        this.entries.push({ inputPattern, value })
    }

    find(tuple: Tuple) {
        for (const entry of this.entries) {
            if (entry.inputPattern.checkDefiniteValuesProvidedBy(tuple))
                return entry.value;
        }
        return null;
    }
}

export default class CommandPatternMatcher<T> {
    
    byCommand: AutoInitMap<string, SingleCommandMatches<T>>

    constructor() {
        this.byCommand = new AutoInitMap(name => new SingleCommandMatches<T>() )
    }

    addCommandStr(commandStr: string, value: T) {
        const command = parseCommand(commandStr);
        const commandMatches  = this.byCommand.get(command.commandName);
        commandMatches.add(command.pattern, value);
    }

    find(commandName: string, tuple: Tuple) {
        const matches = this.byCommand.get(commandName);
        if (!matches)
            return null;
        
        return matches.find(tuple);
    }
}
