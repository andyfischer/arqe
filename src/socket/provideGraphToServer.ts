
import Graph from '../Graph'
import WebSocket from '../platform/ws'
import { relationToJson } from '../Relation'

interface ServerAddress {
    url: string
}

export default function provideGraphToServer(graph: Graph, server: ServerAddress) {
    const ws = new WebSocket(server.url);

    ws.onopen(evt => {
        ws.send(JSON.stringify({t: 'provideGraphToServer', version: 1}));
    });

    ws.onmessage(evt => {
        const { query, replyId } = JSON.parse(evt.data);

        graph.run(query)
        .then(rel => {
            ws.send(JSON.stringify({replyId, relation: relationToJson(rel)}));
        });
    });
}

