
import Command, { CommandFlags } from './Command'
import Graph from './Graph'
import Tuple from './Tuple'
import Pattern from './Pattern'
import Pipe from './Pipe'

export default class CommandStep {
    graph: Graph
    flags: CommandFlags
    command: Command
    commandName: string
    pattern: Pattern
    input: Pipe
    output: Pipe

    constructor (graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.commandName = command.commandName;
        this.flags = command.flags;
        this.pattern = command.toPattern();
    }
}
