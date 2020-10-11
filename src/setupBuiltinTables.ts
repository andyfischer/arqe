
import Graph from './Graph'
import setupGraphReflection from './tables/GraphReflection'

export default function setupBuiltinTables(graph: Graph) {
    graph.provide(setupGraphReflection(graph))
}
