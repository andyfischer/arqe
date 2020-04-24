
import 'source-map-support'
import SocketServer from './socket/SocketServer'
import Graph from './Graph'
import bootstrapGraph from './bootstrapGraph'
import createWebSocketServer from './socket/createWebSocketServer'
import Path from 'path'

export async function main() {
    const graph = Graph.loadFromDumpFile(Path.join(__dirname, '../src/source.graph'));

    const wsServer = await createWebSocketServer(graph);
    const serverSocket = new SocketServer(wsServer, graph)

    serverSocket.on('send', ({ socket, query, finish, rel, error }) => {
        if (finish)
            console.log(`[server] ${query} -> #done`);
        else
            console.log(`[server] ${query} -> ${rel || error}`);
    });
}
