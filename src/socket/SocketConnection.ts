
import WebSocket from 'ws'
import { createUniqueEntity } from '../GraphORM'
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import logError from '../logError'
import parseCommand from '../parseCommand'
import Command from '../Command'

export default class SocketConnection {
    ws: WebSocket
    graph: Graph
    graphContext: GraphContext

    send(data) {
        this.ws.send(JSON.stringify(data))
    }

    async handleCommand(reqid: string, command: Command) {
        command.respond = (result) => {
            this.send({reqid, result});
        }

        await this.graphContext.handleCommand(command)
    }

    constructor(graph: Graph, ws: WebSocket) {
        this.graph = graph
        this.ws = ws;

        const id = createUniqueEntity(graph, 'connection')
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
            this.graph.handleCommandStr(`delete connection/${id} *`)
            console.log(`server: closed connection/${id}`);
        });
    }
}
