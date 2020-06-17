
import Graph from './Graph'
import Tuple from './Tuple'
import Pattern from './Pattern'
import Stream from './Stream'

export default interface SearchOperation extends Stream {
    graph: Graph
    pattern: Pattern;
    subSearchDepth: number

    next: (rel: Pattern) => void
    done: () => void
}

export function newTupleSearch(graph: Graph, pattern: Pattern, output: Stream): SearchOperation {
    return {
        graph,
        pattern,
        subSearchDepth: 0,
        next(rel) { output.next(rel) },
        done() { output.done() }
    }
}
