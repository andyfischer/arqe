
import WebSocket from 'ws'
import Graph from '../Graph'
import Command from '../Command'
import logError from '../logError'
import EventEmitter from 'events'
import parseCommand from '../parseCommand'
import receiveToStringList from '../receiveToStringList'

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

    send(query, data) {
        this.emit('send', { query, response: data.msg, error: data.err });
        this.ws.send(JSON.stringify(data))
    }

    async handleCommand(reqid: string, query: string) {
        this.graph.run2(query, receiveToStringList((msg) => {
            this.send(query, {reqid, msg});
        }))
    }

    constructor(graph: Graph, ws: WebSocket) {
        super();

        this.graph = graph
        this.ws = ws;

        const id = createUniqueEntity(graph, 'connection');

        // this.graphContext = new GraphContext(this.graph);
        // this.graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });

        ws.on('message', async (message) => {

            this.emit('received', message);

            const data = JSON.parse(message);
            const { reqid, query } = data;

            if (!query) {
                this.send(null, { reqid, err: "#error protocal error, missing 'query'" });
                return;
            }

            try {
                await this.handleCommand(reqid, query);

            } catch (err) {
                logError(err);
                this.send(query, {reqid, internalError: true, err});
            }
        });

        ws.on('close', async () => {
            this.graph.runSilent(`delete connection/${id} *`)
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
