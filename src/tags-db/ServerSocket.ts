
import WebSocket from 'ws'
import Graph from './Graph'
import GraphContext from './GraphContext'
import parseCommand from './parseCommand'

export default class ServerSocket {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {

            const graphContext = new GraphContext(this.graph)

            ws.on('message', async (str) => {
                const data = JSON.parse(str);
                const { reqid, command } = data;

                try {
                    const parsedCommand = parseCommand(command);
                    const result = await graphContext.handleCommand(parsedCommand)
                    ws.send(JSON.stringify({reqid, result}));

                } catch (err) {
                    ws.send(JSON.stringify({reqid, internalError: true, err}));
                }
            });
        });
    }
}
