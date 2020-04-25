
import WebSocket from 'ws'
import Graph from '../Graph'
import Command from '../Command'
import logError from '../logError'
import EventEmitter from 'events'
import parseCommand from '../parseCommand'
import SocketApi from '../code-generation/SocketApi'
import Relation from '../Relation'

class Connection extends EventEmitter {
    ws: WebSocket
    graph: Graph
    api: SocketApi

    send(query, data) {
        this.emit('send', { query, rel: data.rel, finish: data.finish, error: data.err });
        this.ws.send(JSON.stringify(data))
    }

    constructor(graph: Graph, ws: WebSocket) {
        super();

        this.graph = graph
        this.ws = ws;
        this.api = new SocketApi(graph);
        const id = this.api.createUniqueConnection();
        console.log(`[server] opened ${id}`);

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

                console.log('[server] running: ' + query);
                this.graph.run(query, {
                    relation: (rel: Relation) => {
                        this.send(query, { reqid, rel: rel.stringifyRelation() });
                    },
                    finish: () => {
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
            console.log(`[server] closed ${id}`);
        });
    }
}

export default class SockerServer extends EventEmitter {
    graph: Graph
    wss: WebSocket.Server

    constructor(wss: WebSocket.Server, graph: Graph) {
        super();

        this.graph = graph || new Graph()
        this.wss = wss;

        this.wss.on('connection', (ws) => {
            const socketConnection = new Connection(this.graph, ws);

            socketConnection.on('send', data => {
                this.emit('send', { socket: this, ...data });
            });
        });
    }
}
