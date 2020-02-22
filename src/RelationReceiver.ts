
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import { RespondFunc } from './Graph'
import GetResponseFormatter from './GetResponseFormatter'
import GetResponseFormatterExists from './GetResponseFormatterExists'
import GetResponseFormatterCount from './GetResponseFormatterCount'
import SetResponseFormatter from './SetResponseFormatter'

export default interface RelationReceiver {
    start: () => void
    relation: (rel: Pattern) => void
    finish: () => void
    isDone: () => boolean
}

export function collectRelationReceiverOutput(onDone: (rels: Pattern[]) => void): RelationReceiver {
    const list: Pattern[] = [];
    return {
        start() {},
        relation(rel) { list.push(rel) },
        isDone() { return false; },
        finish() {
            onDone(list);
        }
    }
}

export function receiveToStringRespond(graph: Graph, command: Command, respond: RespondFunc): RelationReceiver {
    if (command.commandName === 'set') {
        return new SetResponseFormatter(graph, command, respond);
    }

    if (command.commandName === 'delete') {
        return {
            start() {},
            relation() {},
            isDone() { return false; },
            finish() { respond('#done') }
        }
    }

    if (command.commandName === 'dump') {
        return {
            start() { respond('#start') },
            relation(rel) { respond(rel.stringifyToCommand()) },
            isDone() { return false; },
            finish() { respond('#done') }
        }
    }

    if (command.flags.count) {
        return new GetResponseFormatterCount(respond);
    }

    if (command.flags.exists) {
        return new GetResponseFormatterExists(respond);
    }

    const formatter = new GetResponseFormatter(); 
    const pattern = command.toPattern();
    formatter.extendedResult = command.flags.x || command.commandName === 'listen'
    formatter.listOnly = command.flags.list;
    formatter.asMultiResults = pattern.isMultiMatch();
    formatter.respond = respond;
    formatter.pattern = pattern;
    formatter.schema = graph.schema;

    return formatter;
}
