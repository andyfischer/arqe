
import Graph from './Graph'

export default function bootstrapGraph(graph: Graph) {
    graph.runSilent('set typeinfo/branch .inherits')
    graph.runSilent('set typeinfo/testcase .inherits')
    graph.runSilent('set typeinfo/testcase .order == before')
    graph.runSilent('set typeinfo/typeinfo .order == before')
    graph.runSilent('set typeinfo/branch .order == after')
}
