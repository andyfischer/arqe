
import Graph from './Graph'

export default function bootstrapGraph(graph: Graph) {
    graph.handleCommandStr('set typeinfo/branch .inherits')
    graph.handleCommandStr('set typeinfo/testcase .inherits')
    graph.handleCommandStr('set typeinfo/testcase .order == before')
    graph.handleCommandStr('set typeinfo/typeinfo .order == before')
    graph.handleCommandStr('set typeinfo/branch .order == after')
}
