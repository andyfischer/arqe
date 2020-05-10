import WebSocket from 'ws';
import { RespondFunc } from '../Graph';
interface Listener {
    respond: (msg: string) => void;
    streaming?: boolean;
}
interface PendingQuery {
    query: string;
    respond: RespondFunc;
}
export default class CommandConnection {
    ws: WebSocket;
    nextReqId: number;
    connectionId: string;
    pendingForConnection: PendingQuery[];
    reqListeners: {
        [id: string]: Listener;
    };
    constructor(ws: WebSocket);
    close(): Promise<void>;
    run(query: string, respond: RespondFunc): Promise<void>;
}
export declare function connectToServer(host: string): CommandConnection;
export {};
