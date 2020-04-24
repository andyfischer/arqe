
import WebSocket from 'ws'
import Graph from '../Graph'
import SocketApi from '../code-generation/SocketApi'

export default function createWebSocketServer(graph: Graph) {

    const api = new SocketApi(graph);
    const port = api.getServerPort();

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

    console.log(`Now listening on port ${port}`);

    return server;
}
