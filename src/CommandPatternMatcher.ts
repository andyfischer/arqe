import TuplePatternMatcher from "./TuplePatternMatcher"
import parseCommand from "./parseCommand"
import AutoInitMap from "./utils/AutoInitMap"
import Tuple from "./Tuple"

export default class CommandPatternMatcher<T> {
    
    byCommand: AutoInitMap<string, TuplePatternMatcher<T>>

    constructor() {
        this.byCommand = new AutoInitMap(name => new TuplePatternMatcher());
    }

    addCommandStr(commandStr: string, val: T) {
        const command = parseCommand(commandStr);
        const commandMatcher = this.byCommand.get(command.commandName);
        commandMatcher.add(command.pattern, val);
    }

    findCommandMatcher(commandName: string) {
        return this.byCommand.get(commandName);
    }

    find(commandName: string, tuple: Tuple) {
        const commandMatcher = this.byCommand.get(commandName);
        if (!commandMatcher)
            return null;
        return commandMatcher.find(tuple);
    }
}
