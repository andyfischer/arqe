
import WebSocket from 'ws'
import Graph from '../../Graph'
// import SocketDAO from './generated/SocketDAO'
import EventEmitter from 'events'
import logError from '../../utils/logError'
import Tuple from '../../Tuple'

/*
export default class Connection extends EventEmitter {
    ws: WebSocket
    graph: Graph
    api: SocketDAO

    send(query, data) {
        this.emit('send', { query, rel: data.rel, finish: data.finish, error: data.err });
        this.ws.send(JSON.stringify(data))
    }

    constructor(graph: Graph, ws: WebSocket) {
        super();

        this.graph = graph
        this.ws = ws;
        this.api = new SocketDAO(graph);
        const id = this.api.createUniqueConnection();
        console.log(`[${id} connected]`);

        ws.on('message', async (message) => {

            this.emit('received', message);

            const data = JSON.parse(message);
            const { reqid, query } = data;
            let sentFinish = false;

            if (!query) {
                this.send(null, { reqid, err: "#error protocal error, missing 'query'" });
                console.log(`received malformed request (missing 'query'): ${query}`)
                return;
            }

            try {

                console.log(`[${id}] ${query}`);
                this.graph.run(query, {
                    next: (t: Tuple) => {
                        this.send(query, { reqid, rel: t.str() });
                    },
                    done: () => {
                        if (sentFinish)
                            throw new Error(`saw duplicate 'finish' event`);

                        this.send(query, { reqid, finish: true });
                        sentFinish = true;
                    }
                });

            } catch (err) {
                logError(err);
                this.send(query, {reqid, internalError: true, err});
            }
        });

        ws.on('close', async () => {
            this.api.deleteConnection(id);
            console.log(`[${id} closed]`);
        });
    }
}
*/
