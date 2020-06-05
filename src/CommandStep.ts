
import Command, { CommandFlags } from './Command'
import Graph from './Graph'
import Tuple from './Tuple'
import Pattern from './Pattern'
import TupleReceiver from './TupleReceiver'
import { receiveToTupleList } from './receiveUtils'
import SearchOperation from './SearchOperation'
import RelationPipe from './RelationPipe'

export default class CommandStep {
    graph: Graph
    flags: CommandFlags
    command: Command
    commandName: string
    pattern: Pattern
    input: RelationPipe
    output: RelationPipe

    constructor (graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.commandName = command.commandName;
        this.flags = command.flags;
        this.pattern = command.toPattern();
    }

    toRelationSearch(): SearchOperation {

        if (!this.output)
            throw new Error('missing this.output');

        const output = this.output;

        return {
            graph: this.graph,
            pattern: this.pattern,
            subSearchDepth: 0,
            relation(r) { output.relation(r) },
            finish() { output.finish() },
        }
    }
}
