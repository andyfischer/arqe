import Graph from './Graph';
import StorageProvider from './StorageProvider';
import RelationPattern from './RelationPattern';
export interface Mount {
    pattern: RelationPattern;
    storage: StorageProvider;
}
export default class FilesystemMounts {
    graph: Graph;
    mounts: {
        [id: string]: Mount;
    };
    constructor(graph: Graph);
    iterateMounts(): Generator<Mount, void, unknown>;
    regenerateMounts(): {};
    onChange(): void;
}
