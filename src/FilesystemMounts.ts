
import Graph from './Graph'
import StorageProvider from './StorageProvider'
import { parseRelation } from './parseCommand'
import PlainFileStorage from './PlainFileStorage'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'

export interface Mount {
    pattern: RelationPattern
    storage: StorageProvider
}

export default class FilesystemMounts {
    graph: Graph

    mounts: { [id: string]: Mount }

    constructor(graph: Graph) {
        this.graph = graph;
        graph.run("listen filesystem-mount/*", resp => this.onChange());
        graph.run("listen filesystem-mount/* option/*", resp => this.onChange());
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
