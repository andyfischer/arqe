/// <reference types="node" />
import WebSocket from 'ws';
import Graph from '../Graph';
import EventEmitter from 'events';
export default class SockerServer extends EventEmitter {
    graph: Graph;
    wss: WebSocket.Server;
    constructor(wss: WebSocket.Server, graph: Graph);
}
