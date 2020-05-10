import Command from './Command';
import CommandConnection from './socket/CommandConnection';
import RelationPattern from './RelationPattern';
import UpdateContext from './UpdateContext';
import { RespondFunc } from './Graph';
export default class WebSocketProvider {
    host: string;
    connection: CommandConnection;
    pattern: RelationPattern;
    constructor(host: string, pattern: RelationPattern);
    handle(command: Command, respond: RespondFunc): void;
}
export declare function updateWebSocketProviders(cxt: UpdateContext): WebSocketProvider[];
