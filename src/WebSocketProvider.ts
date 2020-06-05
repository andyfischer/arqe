
import Command from './Command'
import ClientConnection, { connectToServer } from './socket/ClientConnection'
import Pattern, { parsePattern } from './Pattern'
import UpdateContext from './UpdateContext'

export default class WebSocketProvider {

    host: string
    connection: ClientConnection
    pattern: Pattern

    constructor(host: string, pattern: Pattern) {
        this.host = host;
        this.pattern = pattern;
    }
}

export function updateWebSocketProviders(cxt: UpdateContext) {
    const syncs: WebSocketProvider[] = [];

    for (const rel of cxt.getTuples('schema provider/wssync *')) {

        const options = cxt.getOptionsObject(rel.stringify());
        const anchor = rel.removeType('provider').removeType('schema');

        if (!options.host)
            continue;

        console.log('Mounting WS with options: ', options, ' on pattern: ', anchor.stringify());
        syncs.push(new WebSocketProvider(options.host, anchor));
    }

    return syncs;
}
