import TuplePatternMatcher from "./TuplePatternMatcher"
import parseCommand from "./parseCommand"
import AutoInitMap from "./utils/AutoInitMap"
import Tuple from "./Tuple"

class OneCommandMatcher<T> {
    commandName: string
    byPattern = new TuplePatternMatcher<T>()

    constructor(commandName: string) {
        this.commandName = commandName;
    }
}

export default class CommandPatternMatcher<T> {
    
    byCommand: AutoInitMap<string, OneCommandMatcher<T>> 

    constructor() {
        this.byCommand = new AutoInitMap(name => new OneCommandMatcher(name));
    }

    addCommandStr(commandStr: string, val: T) {
        const command = parseCommand(commandStr);
        const commandMatcher = this.byCommand.get(command.commandName);
        commandMatcher.byPattern.add(command.pattern, val);
    }

    find(commandName: string, tuple: Tuple) {
        const commandMatcher = this.byCommand.get(commandName);
        if (!commandMatcher)
            return null;
        return commandMatcher.byPattern.find(tuple);
    }
}