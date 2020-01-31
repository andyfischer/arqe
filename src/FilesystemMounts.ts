
import Graph from './Graph'
import StorageProvider from './StorageProvider'
import { getIntoObject } from './GraphORM'

export default class FilesystemMounts {
    graph: Graph

    providers: StorageProvider[]

    constructor(graph: Graph) {
        this.graph = graph;
        graph.run("listen filesystem-mount/*", resp => this.onChange());
        graph.run("listen filesystem-mount/* option/*", resp => this.onChange());
    }

    onChange() {
        const providers = [];

        const mounts = this.graph.runSync("get filesystem-mount/*");


        for (const mount of mounts) {
            if (!mount.startsWith("filesystem-mount"))
                throw new Error("internal error, expected filesystem-mount: " + mount);

            const options = getIntoObject(this.graph, `get ${mount} option/*`);

            console.log(`mount ${mount} has options: ${options}`)
        }
    }
}
