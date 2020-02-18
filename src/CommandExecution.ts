
import Command, { CommandFlags } from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import RelationReceiver, { collectRelationReceiverOutput } from './RelationReceiver'
import GetResponseFormatter from './GetResponseFormatter'
import GetResponseFormatterExists from './GetResponseFormatterExists'
import GetResponseFormatterCount from './GetResponseFormatterCount'
import SetResponseFormatter from './SetResponseFormatter'
import RelationSearch from './RelationSearch'
import RelationBuffer from './RelationBuffer'

export default class CommandExecution {
    graph: Graph
    flags: CommandFlags
    command: Command
    commandName: string
    pattern: RelationPattern
    input?: RelationBuffer
    output: RelationReceiver
    start: (exec: CommandExecution) => void

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
            isDone() { return output.isDone() },
            start() { output.start() },
            relation(r) { output.relation(r) },
            error(e) { output.error(e) },
            finish() { output.finish() },
        }
    }

    outputTo(receiver: RelationReceiver) {
        this.output = receiver;
    }

    outputToStringRespond(respond: RespondFunc, configFormat?: (formatter: GetResponseFormatter) => void) {
        if (this.command.commandName === 'set') {
            this.output = new SetResponseFormatter(this.graph, this.command, respond);
            return;
        }

        if (this.command.commandName === 'delete') {
            this.output = {
                start() {},
                error(e) { respond('#error ' + e); },
                relation() {},
                isDone() { return false; },
                finish() { respond('#done') }
            }
            return;
        }

        if (this.output)
            throw new Error("already have a configured output");

        if (this.flags.count) {
            this.output = new GetResponseFormatterCount(respond);
            return;
        }

        if (this.flags.exists) {
            this.output = new GetResponseFormatterExists(respond);
            return;
        }

        const formatter = new GetResponseFormatter(); 
        formatter.extendedResult = this.flags.x || this.command.commandName === 'listen'
        formatter.listOnly = this.flags.list;
        formatter.asMultiResults = this.pattern.isMultiMatch();
        formatter.respond = respond;
        formatter.pattern = this.pattern;
        formatter.schema = this.graph.schema;

        if (configFormat)
            configFormat(formatter);

        this.output = formatter;
    }

    outputToRelationList(onDone: (rels: Relation[]) => void) {
        if (this.output)
            throw new Error("already have a configured output");

        this.output = collectRelationReceiverOutput(onDone);
    }
}
