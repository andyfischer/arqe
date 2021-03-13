
import Graph from '../Graph'
import { jsonToQuery } from '../Query'

export default class SocketClient {
    graph: Graph
    wss: any

    constructor(graph: Graph, wss) {
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


