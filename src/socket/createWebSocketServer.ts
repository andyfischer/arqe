
import WebSocket from 'ws'
import Graph from '../Graph'
import SocketApi from '../code-generation/SocketApi'

function createServer(graph: Graph, port: number): Promise<WebSocket.Server> {
    const server = new WebSocket.Server({
      port,
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

    return new Promise((resolve, reject) => {
        server.on('listening', () => resolve(server));
        server.on('error', reject);
    });
}

function isAddressInUseError(e) {
    return e.code === 'EADDRINUSE';
}

export default async function createWebSocketServer(graph: Graph) {

    const api = new SocketApi(graph);
    let port = parseInt(api.getServerPort());
    let attempt = 0;

    while (true) {
        if (attempt > 5)
            throw new Error('passed max attempts');

        try {
            const server = await createServer(graph, port);
            console.log(`[server] Now listening on port ${port}`);
            return server;

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

    return null;
}
