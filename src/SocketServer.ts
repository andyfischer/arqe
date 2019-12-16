
import WebSocket from 'ws'
import Graph from './Graph'
import GraphContext from './GraphContext'
import parseCommand from './parseCommand'
import { createUniqueEntity } from './GraphORM'
import logError from './logError'

export default class ServerSocket {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {

            const id = createUniqueEntity(graph, 'connection')
            console.log(`server: opened connection/${id}`);

            const graphContext = new GraphContext(this.graph);
            graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });

            ws.on('message', async (str) => {
                const data = JSON.parse(str);
                const { reqid, command } = data;

                try {
                    const parsedCommand = parseCommand(command);

                    parsedCommand.respond = (result) => {
                        ws.send(JSON.stringify({reqid, result}));
                    }

                    parsedCommand.respondPart = (result) => {
                        ws.send(JSON.stringify({reqid, result, more: true}));
                    }

                    parsedCommand.respondEnd = () => {
                        ws.send(JSON.stringify({reqid}));
                    }

                    await graphContext.handleCommand(parsedCommand)

                } catch (err) {
                    logError(err);
                    ws.send(JSON.stringify({reqid, internalError: true, err}));
                }
            });

            ws.on('close', async (str) => {
                graph.handleCommandStr(`delete connection/${id} *`)
                console.log(`server: closed connection/${id}`);
            });
        });
    }
}
