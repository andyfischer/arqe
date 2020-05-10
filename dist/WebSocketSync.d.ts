import CommandConnection from './socket/CommandConnection';
import RelationPattern from './RelationPattern';
import UpdateContext from './UpdateContext';
export default class WebSocketSync {
    host: string;
    connection: CommandConnection;
    pattern: RelationPattern;
    constructor(host: string, pattern: RelationPattern);
}
export declare function updateWebSocketSyncs(cxt: UpdateContext): WebSocketSync[];
