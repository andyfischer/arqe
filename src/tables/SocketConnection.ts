import Tuple from "../Tuple";
import TableMount from "../TableMount";
import IDSource from "../utils/IDSource";
import WebSocket from '../platform/ws'
import parseTuple from "../stringFormat/parseTuple";
import { unwrapTuple } from "../tuple/UnwrapTupleCallback";

export class Connection {
    socketId: string
    url: string
    webSocket: WebSocket
    connectionState: 'connecting' | 'connect-failed' | 'connected'

    nextMessageId
    pendingMessages

    constructor(socketId: string, url: string) {
        this.socketId = socketId;
        this.url = url;

        this.webSocket = new WebSocket(url);
        this.connectionState = 'connecting'

        this.webSocket.onopen = () => {
            this.connectionState = 'connected'
        }

        this.webSocket.onerror = () => {
            this.connectionState = 'connect-failed'
        }
    }
}

export function setupTables(): TableMount[] {

    const socketConnections = new TableMount('SocketConnections', parseTuple('socket socketId url? connectionState?'));

    const nextConnId = new IDSource();
    const connections = new Map<string, Connection>();

    socketConnections.addHandler('insert', 'socketId((unique)) url', unwrapTuple(({ url }) => {
        const id = nextConnId.take();
        const connection = new Connection(id, url);
        connections.set(id, connection);
        return { 'socketId': id }
    }));

    socketConnections.addHandler('find-with', 'socketId', unwrapTuple(({ socketId }) => {
        return connections.get(socketId);
    }));

    socketConnections.addHandler('list-all', '', unwrapTuple(() => {
        return connections.values();
    }));

    const socketMessage = new TableMount('SocketMessage', parseTuple('socket messageId message? response?'));

    socketMessage.addHandler('insert', 'socketId messageId((unique)) message', unwrapTuple(({socketId, message}) => {
        const socket = connections.get(socketId);
        if (!socket)
            throw new Error('socket not found');
        
        
    }));

    return [ socketConnections ];
}
