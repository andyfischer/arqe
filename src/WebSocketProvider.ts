
import CommandConnection, { connectToServer } from './socket/CommandConnection'
import RelationPattern, { parsePattern } from './RelationPattern'
import UpdateContext from './UpdateContext'

export default class WebSocketProvider {

    host: string
    connection: CommandConnection
    pattern: RelationPattern

    constructor(host: string, pattern: RelationPattern) {
        this.host = host;
        this.pattern = pattern;
        this.connection = connectToServer(host);
    }
}

export function updateWebSocketProviders(cxt: UpdateContext) {
    const syncs: WebSocketProvider[] = [];

    for (const rel of cxt.getRelations('tag-definition provider/wssync *')) {

        const options = cxt.getOptionsObject(rel.pattern().stringify());

        console.log('mounting WS with options: ', options);

        /*
        if (!options.host || !options.pattern)
            continue;

        const pattern = parsePattern(options.pattern);

        syncs.push(new WebSocketSync(options.host, pattern));
        */
    }

    return syncs;
}
