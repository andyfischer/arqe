
import WebSocket from 'ws'
import Graph from '../Graph'
import Command from '../Command'
import logError from '../logError'
import EventEmitter from 'events'
import parseCommand from '../parseCommand'
import SocketApi from '../code-generation/SocketApi'
import Relation from '../Relation'

export function createUniqueEntity(graph: Graph, typename: string) {
    const result = graph.runSync(`set ${typename}/#unique`);

    const parsed = parseCommand(result);

    if (parsed.commandName !== 'set')
        throw new Error('expected reply with "set": ' + result);

    return parsed.tags[0].tagValue;
}

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

        ws.on('message', async (message) => {

            this.emit('received', message);

            const data = JSON.parse(message);
            const { reqid, query } = data;

            if (!query) {
                this.send(null, { reqid, err: "#error protocal error, missing 'query'" });
                return;
            }

            try {

                this.graph.run(query, {
                    relation: (rel: Relation) => {
                        this.send(query, { reqid, rel: rel.stringifyRelation() });
                    },
                    isDone: () => false,
                    finish: () => {
                        this.send(query, { reqid, finish: true });
                    }
                });

            } catch (err) {
                logError(err);
                this.send(query, {reqid, internalError: true, err});
            }
        });

        ws.on('close', async () => {
            this.api.deleteConnection(id);
            console.log(`server: closed connection/${id}`);
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
