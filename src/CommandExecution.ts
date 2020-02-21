
import Command, { CommandFlags } from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import RelationSearch from './RelationSearch'
import { receiveToStringRespond } from './RelationReceiver'

export default class CommandExecution {
    graph: Graph
    flags: CommandFlags
    command: Command
    commandName: string
    pattern: RelationPattern
    input?: RelationReceiver
    output: RelationReceiver
    start?: () => void

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
            start() { output.start() },
            relation(r) { output.relation(r) },
            finish() { output.finish() },
        }
    }

    outputTo(receiver: RelationReceiver) {
        if (this.output)
            throw new Error('already have this.output');

        this.output = receiver;
    }

    outputToStringRespond(respond: RespondFunc) {
        if (this.output)
            throw new Error('already have this.output');

        this.output = receiveToStringRespond(this.graph, this.command, respond);
    }

    outputToRelationList(onDone: (rels: Relation[]) => void) {
        if (this.output)
            throw new Error("already have a configured output");

        this.output = collectRelationReceiverOutput(onDone);
    }
}
