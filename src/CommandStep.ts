
import Command, { CommandFlags } from './Command'
import Graph from './Graph'
import Tuple from './Tuple'
import Pattern from './Pattern'
import Stream from './Stream'
import { receiveToTupleList } from './receiveUtils'
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

    /*
    toRelationSearch(): SearchOperation {

        if (!this.output)
            throw new Error('missing this.output');

        const output = this.output;

        return {
            graph: this.graph,
            pattern: this.pattern,
            subSearchDepth: 0,
            next(r) { output.next(r) },
            done() { output.done() },
        }
    }
    */
}
