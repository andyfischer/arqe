
import WebSocket from 'ws'
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import { createUniqueEntity } from '../GraphORM'
import Command from '../Command'
import parseCommand from '../parseCommand'
import logError from '../logError'
import EventEmitter from 'events'

class Connection extends EventEmitter {
    ws: WebSocket
    graph: Graph
    graphContext: GraphContext

    send(query, data) {
        this.emit('send', { query, response: data.msg, error: data.err });
        this.ws.send(JSON.stringify(data))
    }

    async handleCommand(reqid: string, query: string) {
        const parsedCommand = parseCommand(query);

        await this.graphContext.handleCommand(parsedCommand, (msg) => {
            this.send(query, {reqid, msg});
        });
    }

    constructor(graph: Graph, ws: WebSocket) {
        super();

        this.graph = graph
        this.ws = ws;

        const id = createUniqueEntity(graph, 'connection');

        this.graphContext = new GraphContext(this.graph);
        this.graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });

        ws.on('message', async (query) => {

            this.emit('received', query);

            const data = JSON.parse(query);
            const { reqid, command } = data;

            try {
                this.handleCommand(reqid, command);

            } catch (err) {
                logError(err);
                this.send(query, {reqid, internalError: true, err});
            }
        });

        ws.on('close', async () => {
            this.graph.run(`delete connection/${id} *`)
            console.log(`server: closed connection/${id}`);
        });
    }
}

export default class ServerSocket extends EventEmitter {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        super();

        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {
            const socketConnection = new Connection(this.graph, ws);

            socketConnection.on('send', data => {
                this.emit('send', { socket: this, ...data });
            });
        });
    }
}
