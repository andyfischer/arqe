
import Graph from '../Graph'
import { jsonToQuery } from '../Query'
import WebSocket from 'ws'

interface ServerOptions {
    port?: number
}

export default class SocketServer {
    graph: Graph
    wss: any

    constructor(graph: Graph, opts: ServerOptions = {}) {
        const wss = new WebSocket.Server({
            port: opts.port || 6321
        });

        wss.on('connection', ws => {

            console.log('got connection ', ws)

            ws.on('message', (messageStr: string) => {
                const message = JSON.parse(messageStr);
                if (!message.query) {
                    ws.send(JSON.stringify({error: "protocol error, message was missing .query"}));
                    return;
                }

                const query = jsonToQuery(message.query);

                graph.run(query)
                .then(rel => {
                    const responseData: { rel: any, replyId?: any } = {
                        rel: rel.toJson()
                    }

                    if (message.replyId)
                        responseData.replyId = message.replyId;

                    ws.send(JSON.stringify(responseData));
                });
            })
        });
    }
}


