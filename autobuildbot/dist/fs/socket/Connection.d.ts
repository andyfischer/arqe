/// <reference types="node" />
import WebSocket from 'ws';
import Graph from '../Graph';
import SocketApi from '../code-generation/SocketApi';
import EventEmitter from 'events';
export default class Connection extends EventEmitter {
    ws: WebSocket;
    graph: Graph;
    api: SocketApi;
    send(query: any, data: any): void;
    constructor(graph: Graph, ws: WebSocket);
}
