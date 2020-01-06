
import WebSocket from 'ws'
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import { createUniqueEntity } from '../GraphORM'
import Command from '../Command'
import parseCommand from '../parseCommand'
import logError from '../logError'

class Connection {
    ws: WebSocket
    graph: Graph
    graphContext: GraphContext

    send(data) {
        this.ws.send(JSON.stringify(data))
    }

    async handleCommand(reqid: string, command: Command) {
        await this.graphContext.handleCommand(command, (msg) => {
            this.send({reqid, msg});
        });
    }

    constructor(graph: Graph, ws: WebSocket) {
        this.graph = graph
        this.ws = ws;

        const id = createUniqueEntity(graph, 'connection');

        this.graphContext = new GraphContext(this.graph);
        this.graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });

        ws.on('message', async (str) => {
            const data = JSON.parse(str);
            const { reqid, command } = data;

            try {
                const parsedCommand = parseCommand(command);
                this.handleCommand(reqid, parsedCommand);

            } catch (err) {
                logError(err);
                this.ws.send(JSON.stringify({reqid, internalError: true, err}));
            }
        });

        ws.on('close', async (str) => {
            this.graph.run(`delete connection/${id} *`)
            console.log(`server: closed connection/${id}`);
        });
    }
}

export default class ServerSocket {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {
            const socketConnection = new Connection(this.graph, ws);
        });
    }
}
