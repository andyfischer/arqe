
import WebSocket from 'ws'
import Graph from './Graph'

export default class ServerSocket {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {
            ws.on('message', async (str) => {
                const data = JSON.parse(str);
                const { reqid, command } = data;
                try {
                    const result = await this.handleCommand(command)
                    ws.send(JSON.stringify({reqid, result}));
                } catch (err) {
                    console.log('uncaught server error: ', err);
                    ws.send(JSON.stringify({reqid, internalError: true, err}));
                }
            });
        });
    }

    async handleCommand(command: string) {
        const response = this.graph.handleCommandStr(command);
    }
}
