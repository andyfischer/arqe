
import Graph from './Graph'

export default function bootstrapGraph(graph: Graph) {
    graph.handleCommandStr('save typeinfo/branch .inherits')
    graph.handleCommandStr('save typeinfo/testcase .inherits')
    graph.handleCommandStr('save typeinfo/testcase .order == before')
    graph.handleCommandStr('save typeinfo/typeinfo .order == before')
    graph.handleCommandStr('save typeinfo/branch .order == after')
}
