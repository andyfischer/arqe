
import HTTP from 'http'
import WebSocket from 'ws'
import SocketApi from '../code-generation/SocketApi'
import Graph from '../Graph'
import Connection from './Connection'
import EventEmitter from 'events'

function isAddressInUseError(e) {
    return e.code === 'EADDRINUSE';
}

function getData(stream, callback: (s: string) => void) {
    let body = '';
    stream.on('data', data => { body += data.toString() });
    stream.on('end', () => callback(body));
}

export default class WebServer extends EventEmitter {
    graph: Graph
    httpServer: HTTP.Server
    wsServer: WebSocket.Server
    port: number
    api: SocketApi

    constructor(graph: Graph) {
        super();
        this.graph = graph;
        this.api = new SocketApi(this.graph);
    }

    handlePostCommand(query: string, res) {
        const id = this.api.createUniqueConnection();

        res.statusCode = 200;
        this.graph.run(query, {
            relation: (rel) => {
                res.write(rel.stringify() + '\n');
                this.emit('send', { query, rel });
            },
            finish: () => {
                res.end();
                this.emit('send', { query, finish: true });
            }
        });
    }

    async createHttpServer(port: number) {
        const httpServer = HTTP.createServer((req, res) => {
            if (req.url === '/run') {
                if (req.method === 'POST') {
                    getData(req, (query: string) => {
                        this.handlePostCommand(query, res);
                    });
                    return;
                }
            }

            res.statusCode = 404;
            res.end('Not found');
        });

        httpServer.listen(port);

        await new Promise((resolve, reject) => {
            httpServer.on('listening', resolve);
            httpServer.on('error', reject);
        });

        this.httpServer = httpServer;
    }

    async createWsServer() {
        const wsServer = new WebSocket.Server({
          server: this.httpServer,
          path: '/ws',
          perMessageDeflate: {
            zlibDeflateOptions: {
              // See zlib defaults.
              chunkSize: 1024,
              memLevel: 7,
              level: 3
            },
            zlibInflateOptions: {
              chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
          }
        });

        wsServer.on('error', err => console.error('wsserver error: ' + err));

        wsServer.on('connection', (ws) => {
            const socketConnection = new Connection(this.graph, ws);

            socketConnection.on('send', data => {
                this.emit('send', { socket: this, ...data });
            });
        });

        this.wsServer = wsServer;
    }

    async createAndListen() {
        const api = new SocketApi(this.graph);
        let port = parseInt(api.getServerPort());
        let attempt = 0;
        
        while (true) {
            if (attempt > 5)
                throw new Error('passed max attempts');

            try {
                await this.createHttpServer(port);
                await this.createWsServer();
                console.log(`[server] Now listening on port ${port}`);
                this.port = port;
                return;

            } catch (e) {
                if (isAddressInUseError(e)) {
                    console.log(`[server] port ${port} is already in use, trying next port..`);
                    attempt += 1;
                    port += 1;
                    continue;
                }

                throw e;
            }
        }
    }

    async start() {
        await this.createAndListen();
    }
}
