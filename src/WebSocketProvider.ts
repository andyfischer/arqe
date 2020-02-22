
import Command from './Command'
import CommandConnection, { connectToServer } from './socket/CommandConnection'
import Pattern, { parsePattern } from './Pattern'
import UpdateContext from './UpdateContext'
import { RespondFunc } from './Graph'

export default class WebSocketProvider {

    host: string
    connection: CommandConnection
    pattern: Pattern

    constructor(host: string, pattern: Pattern) {
        this.host = host;
        this.pattern = pattern;
        this.connection = connectToServer(host);
    }

    handle(command: Command, respond: RespondFunc) {
        console.log('ws handling command: ', command.stringify())
        // provider.connection.run(command.stringify(), respond);
    }
}

export function updateWebSocketProviders(cxt: UpdateContext) {
    const syncs: WebSocketProvider[] = [];

    for (const rel of cxt.getRelations('schema provider/wssync *')) {

        const options = cxt.getOptionsObject(rel.stringify());
        const anchor = rel.removeType('provider').removeType('schema');

        if (!options.host)
            continue;

        console.log('Mounting WS with options: ', options, ' on pattern: ', anchor.stringify());
        syncs.push(new WebSocketProvider(options.host, anchor));
    }

    return syncs;
}
