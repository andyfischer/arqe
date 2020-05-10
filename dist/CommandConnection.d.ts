import WebSocket from 'ws';
interface Listener {
    receivePart?: (msg: string) => void;
    receiveEnd?: () => void;
}
export default class CommandConnection {
    ws: WebSocket;
    nextReqId: number;
    connectionId: string;
    reqListeners: {
        [id: string]: Listener;
    };
    constructor(ws: WebSocket);
    setup(): Promise<void>;
    close(): Promise<void>;
    _runWithListener(command: string, listener: Listener): Promise<void>;
    run(command: string): Promise<string>;
}
export {};
