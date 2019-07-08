
export function receiveToStringRespond(graph: Graph, command: Command, respond: RespondFunc): RelationReceiver {

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
