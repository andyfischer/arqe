import WebSocket from 'ws';
import RelationReceiver from '../RelationReceiver';
import IDSource from '../utils/IDSource';
import GraphLike from '../GraphLike';
export declare type RespondFunc = (msg: string) => void;
interface PendingQuery {
    query: string;
    output: RelationReceiver;
}
export default class CommandConnection implements GraphLike {
    ws: WebSocket;
    requestId: IDSource;
    connectionId: string;
    pendingForConnection: PendingQuery[];
    reqListeners: {
        [id: string]: RelationReceiver;
    };
    constructor(ws: WebSocket);
    close(): Promise<void>;
    run(commandStr: string, output?: RelationReceiver): void;
    runSync(commandStr: string): any;
}
export declare function connectToServer(host: string): CommandConnection;
export {};
