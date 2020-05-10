import CommandConnection from './socket/CommandConnection';
import Pattern from './Pattern';
import UpdateContext from './UpdateContext';
export default class WebSocketProvider {
    host: string;
    connection: CommandConnection;
    pattern: Pattern;
    constructor(host: string, pattern: Pattern);
}
export declare function updateWebSocketProviders(cxt: UpdateContext): WebSocketProvider[];
