
import 'source-map-support'
import SocketServer from './socket/SocketServer'
import Graph from './Graph'
import bootstrapGraph from './bootstrapGraph'
import createWebSocketServer from './socket/createWebSocketServer'
import port from './socket/defaultServerPort'

export default async function main() {
    const wsServer = createWebSocketServer();

    console.log(`Now listening on port ${port}`);

    const graph = new Graph()
    bootstrapGraph(graph);

    const serverSocket = new SocketServer(wsServer, graph)

    serverSocket.on('send', ({ socket, query, response, error }) => {
        console.log(`  ${query} -> ${response || error}`);
    });
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
