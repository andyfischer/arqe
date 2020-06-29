
import Path from 'path'
import Graph from './Graph'
import bootstrapGraph from './bootstrapGraph'
import WebServer from './socket/WebServer'
import { loadFromDumpFile } from './DumpFile'
import { loadLocalBootstrapConfigs } from './loadBootstrapConfigs'

export async function main() {
    require('source-map-support').install();

    const graph = new Graph();
    loadLocalBootstrapConfigs(graph);

    const server = new WebServer(graph);
    await server.start();

    /*
    serverSocket.on('send', ({ socket, query, finish, rel, error }) => {
        if (finish)
            console.log(`[server] ${query} -> #done`);
        else
            console.log(`[server] ${query} -> ${rel || error}`);
    });
    */
}
