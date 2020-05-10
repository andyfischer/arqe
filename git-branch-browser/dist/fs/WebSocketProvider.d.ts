import ClientConnection from './socket/ClientConnection';
import Pattern from './Pattern';
import UpdateContext from './UpdateContext';
export default class WebSocketProvider {
    host: string;
    connection: ClientConnection;
    pattern: Pattern;
    constructor(host: string, pattern: Pattern);
}
export declare function updateWebSocketProviders(cxt: UpdateContext): WebSocketProvider[];
