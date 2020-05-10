import Graph from './Graph';
import Pattern from './Pattern';
export default class GraphListenerV2 {
    graph: Graph;
    id: string;
    callback: () => void;
    pattern: Pattern;
    constructor(graph: Graph, pattern: Pattern, callback: () => void);
    trigger(): void;
    close(): void;
}
