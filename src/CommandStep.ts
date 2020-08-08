
import Query, { QueryFlags } from './Query'
import Graph from './Graph'
import Pattern from './Pattern'
import Pipe from './Pipe'

export default class CommandStep {
    graph: Graph
    flags: QueryFlags
    command: Query
    commandName: string
    pattern: Pattern
    input: Pipe
    output: Pipe

    constructor (graph: Graph, command: Query) {
        this.graph = graph;
        this.command = command;
        this.commandName = command.commandName;
        this.flags = command.flags;
        this.pattern = command.toPattern();
    }
}
