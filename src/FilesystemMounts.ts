
import Graph from './Graph'
import StorageProvider from './StorageProvider'
import { parseRelation } from './parseCommand'
import PlainFileStorage from './PlainFileStorage'
import Pattern, { commandToRelationPattern } from './Pattern'
import receiveToStringStream from './receiveToStringStream'

export interface Mount {
    pattern: Pattern
    storage: StorageProvider
}

export default class FilesystemMounts {
    graph: Graph

    mounts: { [id: string]: Mount }

    constructor(graph: Graph) {
        this.graph = graph;
        graph.run2("listen filesystem-mount/*", receiveToStringStream(m => this.onChange()));
        graph.run2("listen filesystem-mount/* option/*", receiveToStringStream(m => this.onChange()));
    }

    *iterateMounts() {
        for (const id in this.mounts)
            yield this.mounts[id];
    }

    regenerateMounts() {
        const mounts = {};

        const mountKeys = this.graph.runSync("get filesystem-mount/*");

        for (const mountKey of mountKeys) {
            if (!mountKey.startsWith("filesystem-mount"))
                throw new Error("internal error, expected filesystem-mount: " + mountKey);

            const options: any = {};
            
            for (const res of this.graph.runSync(`get ${mountKey} option/*`)) {
                const rel = parseRelation(res);

                options[rel.getTagValue("option") as string] = rel.getPayload();
            }

            options.filenameType = options.filenameType || 'filename'

            if (!options.directory)
                continue;

            const storage = new PlainFileStorage();
            storage.filenameType = options.filenameType;
            storage.directory = options.directory;

            const mount: Mount = {
                pattern: commandToRelationPattern(`get ${mountKey} filename/*`),
                storage
            }

            mounts[mountKey] = mount;
        }

        return mounts;
    }

    onChange() {
        this.mounts = this.regenerateMounts();
    }
}
