
import Graph from './Graph'
import FilesystemStorage from './FilesystemStorage'

export default function bootstrapGraph(graph: Graph) {
    graph.run('set typeinfo/branch .inherits')
    graph.run('set typeinfo/testcase .inherits')
    graph.run('set typeinfo/testcase .order == before')
    graph.run('set typeinfo/typeinfo .order == before')
    graph.run('set typeinfo/branch .order == after')

    graph.installStorage('listen filename/* *', new FilesystemStorage())
}
