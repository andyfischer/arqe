import Graph from './Graph';
import StorageProvider from './StorageProvider';
import Pattern from './Pattern';
export interface Mount {
    pattern: Pattern;
    storage: StorageProvider;
}
export default class FilesystemMounts {
    graph: Graph;
    mounts: {
        [id: string]: Mount;
    };
    constructor(graph: Graph);
    iterateMounts(): IterableIterator<Mount>;
    regenerateMounts(): {};
    onChange(): void;
}
