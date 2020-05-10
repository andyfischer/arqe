import WebSocket from 'ws';
import Graph from './Graph';
export default class ServerSocket {
    graph: Graph;
    wss: WebSocket.Server;
    constructor(wss: WebSocket.Server, graph: Graph);
}
