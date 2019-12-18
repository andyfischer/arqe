
import WebSocket from 'ws'
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import SocketConnection from './SocketConnection'

export default class ServerSocket {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {
            const socketConnection = new SocketConnection(this.graph, ws);
        });
    }
}
