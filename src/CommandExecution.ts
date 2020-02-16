
import Command, { CommandFlags } from './Command'
import Graph, { RespondFunc } from './Graph'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import RelationReceiver from './RelationReceiver'
import GetResponseFormatter from './GetResponseFormatter'
import GetResponseFormatterExists from './GetResponseFormatterExists'
import GetResponseFormatterCount from './GetResponseFormatterCount'
import SetResponseFormatter from './SetResponseFormatter'

export default class CommandExecution {
    graph: Graph
    flags: CommandFlags
    command: Command
    pattern: RelationPattern
    output: RelationReceiver

    constructor (graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.flags = command.flags;
        this.pattern = command.toPattern();
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
        formatter.extendedResult = this.flags.x;
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

        const list: Relation[] = [];
        this.output = {
            start() {},
            relation(rel) { list.push(rel) },
            error(e) { console.log('unhandled error in outputToRelationList: ', e) },
            finish() {
                onDone(list);
            }
        }
    }
}
