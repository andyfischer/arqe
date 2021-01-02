
import Graph from './Graph'

function graphReflection(graph: Graph) {
    return {
        'graph-tables(key) name schema': {
            name: 'GraphTables',
            find(i, out) {
                for (const mount of graph.tablesByName.values()) {
                    out.next({name: mount.name, schema: mount.schema.stringify()})
                }
                out.done();
            }
        }
    }
}

export default function setupBuiltinTables(graph: Graph) {
    graph.provide(graphReflection(graph))
    graph.provide(graph.memoryTable.definition())
}
