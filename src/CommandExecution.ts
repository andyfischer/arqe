
import Command, { CommandFlags } from './Command'
import Graph from './Graph'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver, { receiveToRelationList } from './RelationReceiver'
import RelationSearch from './RelationSearch'
import RelationPipe from './RelationPipe'

export default class CommandExecution {
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

    toRelationSearch(): RelationSearch {

        if (!this.output)
            throw new Error('missing this.output');

        const output = this.output;

        return {
            pattern: this.pattern,
            subSearchDepth: 0,
            isDone() { return output.isDone() },
            relation(r) { output.relation(r) },
            finish() { output.finish() },
        }
    }
}
