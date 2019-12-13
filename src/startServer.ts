
import WebSocket from 'ws'
import ServerSocket from './ServerSocket'
import Graph from './Graph'
import bootstrapGraph from './bootstrapGraph'

const port = 42940;

function createWebSocketServer() {
    return new WebSocket.Server({
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
}

export default async function main() {
    const wsServer = createWebSocketServer();

    console.log(`Now listening on port ${port}`);

    const graph = new Graph()
    bootstrapGraph(graph);

    const serverSocket = new ServerSocket(wsServer, graph)

    console.log(`Launching self client..`)
    require('./funcTestClient');
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
