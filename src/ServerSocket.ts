
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

            console.log('server: client connected');

            const graphContext = new GraphContext(this.graph)

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
                    ws.send(JSON.stringify({reqid, internalError: true, err}));
                }
            });

            ws.on('close', async (str) => {
                console.log('server: client closed');
            });
        });
    }
}