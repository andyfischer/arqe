import TuplePatternMatcher from "./TuplePatternMatcher"
import parseCommand from "./parseCommand"
import AutoInitMap from "./utils/AutoInitMap"
import Tuple from "./Tuple"
import TupleTag from "./TupleTag"

function getDefiniteValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        return tag.hasValue()
    })
}

function getUniqueExprTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        return tag.exprValue && tag.exprValue[0] === 'unique'
    })
}

class CommandEntry<T> {
    command: string
    inputPattern: Tuple
    value: T
    definiteValues: TupleTag[]
    uniqueExprs: TupleTag[]

    constructor(command: string, inputPattern: Tuple, value: T) {
        this.command = command;
        this.inputPattern = inputPattern;
        this.value = value;

        this.definiteValues = getDefiniteValueTags(inputPattern);
        this.uniqueExprs = getUniqueExprTags(inputPattern)
    }

    checkHasDefiniteValues(tuple: Tuple) {
        for (const tag of this.definiteValues) {
            const matchingTag = tuple.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue())
                return false;
        }
        return true;
    }
}

class SingleCommandMatches<T> {
    entries: CommandEntry<T>[] = []

    add(entry: CommandEntry<T>) {
        this.entries.push(entry)
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
    
    allEntries: CommandEntry<T>[] = []
    byCommand: AutoInitMap<string, SingleCommandMatches<T>>

    constructor() {
        this.byCommand = new AutoInitMap(name => new SingleCommandMatches<T>() )
    }

    addCommandStr(commandStr: string, value: T) {
        const command = parseCommand(commandStr);
        const commandMatches  = this.byCommand.get(command.commandName);

        const entry: CommandEntry<T> = new CommandEntry<T>(command.commandName,
            command.pattern,
            value);

        commandMatches.add(entry);
        this.allEntries.push(entry);
    }

    entriesByCommand(commandName: string) {
        const byCommand = this.byCommand.getExisting(commandName);
        if (!byCommand)
            return []
        return byCommand.entries;
    }

    find(commandName: string, tuple: Tuple) {
        const matches = this.byCommand.get(commandName);
        if (!matches)
            return null;
        
        return matches.find(tuple);
    }

    findWithUnique(commandName: string, uniqueTag: TupleTag, tuple: Tuple) {
        for (const entry of this.entriesByCommand(commandName)) {
            if (entry.uniqueExprs.length !== 1)
                continue;

            if (entry.uniqueExprs[0].attr !== uniqueTag.attr)
                continue;

            if (!entry.checkHasDefiniteValues(tuple))
                continue;

            return entry.value;
        }

        return null;
    }

    findWithDefiniteValues(commandName: string, tuple: Tuple) {
        for (const entry of this.entriesByCommand(commandName)) {
            if (entry.uniqueExprs.length > 0)
                continue;

            if (entry.checkHasDefiniteValues(tuple))
                return entry.value;
        }

        return null;
    }
}
