
import Command from './Command'
import CommandConnection, { connectToServer } from './socket/CommandConnection'
import RelationPattern, { parsePattern } from './RelationPattern'
import UpdateContext from './UpdateContext'
import { RespondFunc } from './Graph'

export default class WebSocketProvider {

    host: string
    connection: CommandConnection
    pattern: RelationPattern

    constructor(host: string, pattern: RelationPattern) {
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

        const options = cxt.getOptionsObject(rel.pattern.stringify());
        const anchor = rel.pattern.removeType('provider').removeType('schema');

        if (!options.host)
            continue;

        console.log('Mounting WS with options: ', options, ' on pattern: ', anchor.stringify());
        syncs.push(new WebSocketProvider(options.host, anchor));
    }

    return syncs;
}
