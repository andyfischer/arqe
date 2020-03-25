
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

export function receiveToRelationList(onDone: (rels: Pattern[]) => void): RelationReceiver {
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

export function receiveToRelationStream(onRel: (rel: Pattern) => void, onDone: () => void): RelationReceiver {
    return {
        start() {},
        relation: onRel,
        isDone() { return false; },
        finish: onDone
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

    const formatter = new GetResponseFormatter(graph); 
    const pattern = command.toPattern();
    formatter.extendedResult = command.flags.x || command.commandName === 'listen'
    formatter.listOnly = command.flags.list;
    formatter.asMultiResults = pattern.isMultiMatch();
    formatter.respond = respond;
    formatter.pattern = pattern;

    return formatter;
}

export function receiveToNull(): RelationReceiver {
    return {
        start() {  },
        relation(rel) {  },
        isDone() { return true },
        finish() {  }
    }
}
