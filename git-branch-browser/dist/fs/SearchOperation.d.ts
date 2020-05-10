import Graph from './Graph';
import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
export default interface SearchOperation extends RelationReceiver {
    graph: Graph;
    pattern: Pattern;
    subSearchDepth: number;
    relation: (rel: Pattern) => void;
    finish: () => void;
}
export declare function newRelationSearch(graph: Graph, pattern: Pattern, output: RelationReceiver): SearchOperation;
