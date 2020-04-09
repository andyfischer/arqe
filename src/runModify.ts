
import Graph from './Graph'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export interface ModifyRequest {
    graph: Graph
    pattern: Pattern
    targetTagType: string
    transformer: (value: string) => string
    output: RelationReceiver
}

export default function runModify(modify: ModifyRequest) {
}
