
import Graph from './Graph'
import Tuple from './Tuple'
import Pattern from './Pattern'
import TupleReceiver from './TupleReceiver'

export default interface SearchOperation extends TupleReceiver {
    graph: Graph
    pattern: Pattern;
    subSearchDepth: number

    next: (rel: Pattern) => void
    finish: () => void
}

export function newTupleSearch(graph: Graph, pattern: Pattern, output: TupleReceiver): SearchOperation {
    return {
        graph,
        pattern,
        subSearchDepth: 0,
        next(rel) { output.next(rel) },
        finish() { output.finish() }
    }

}
