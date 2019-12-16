
import 'source-map-support'
import WebSocket from 'ws'
import SocketServer from './SocketServer'
import Graph from './Graph'
import bootstrapGraph from './bootstrapGraph'
import createWebSocketServer from './createWebSocketServer'
import port from './defaultServerPort'

export default async function main() {
    const wsServer = createWebSocketServer();

    console.log(`Now listening on port ${port}`);

    const graph = new Graph()
    bootstrapGraph(graph);

    const serverSocket = new SocketServer(wsServer, graph)

    console.log(`Launching self client..`)
    require('./test-graphdb/funcTestClient');
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
