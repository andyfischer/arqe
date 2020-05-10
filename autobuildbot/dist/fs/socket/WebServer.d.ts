/// <reference types="node" />
import HTTP from 'http';
import WebSocket from 'ws';
import Graph from '../Graph';
import EventEmitter from 'events';
export default class WebServer extends EventEmitter {
    graph: Graph;
    httpServer: HTTP.Server;
    wsServer: WebSocket.Server;
    port: number;
    constructor(graph: Graph);
    createHttpServer(port: number): Promise<void>;
    createWsServer(): Promise<void>;
    createAndListen(): Promise<void>;
    start(): Promise<void>;
}
