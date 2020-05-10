import Graph from './Graph';
import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
export interface ModifyRequest {
    graph: Graph;
    pattern: Pattern;
    output: RelationReceiver;
}
export default function runModify(graph: Graph, pattern: Pattern, output: RelationReceiver): void;
