import WebSocket from 'ws';
import RelationReceiver from '../RelationReceiver';
import IDSource from '../utils/IDSource';
import GraphLike from '../GraphLike';
export declare type RespondFunc = (msg: string) => void;
interface PendingQuery {
    query: string;
    output: RelationReceiver;
}
export default class ClientConnection implements GraphLike {
    url: string;
    ws: WebSocket;
    requestId: IDSource;
    connectionId: string;
    autoReconnect: boolean;
    pendingForConnection: PendingQuery[];
    reqListeners: {
        [id: string]: RelationReceiver;
    };
    connectAttemptInProgress: boolean;
    maxReconnectAttempts: number;
    shouldLogReconnect: boolean;
    constructor(url: string);
    openSocket(): Promise<void>;
    start(): Promise<void>;
    setupWebsocket(): void;
    close(): Promise<void>;
    run(commandStr: string, output?: RelationReceiver): void;
    runSync(commandStr: string): any;
}
export declare function connectToServer(): Promise<ClientConnection>;
export {};
