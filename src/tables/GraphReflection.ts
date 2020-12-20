import Graph from "../Graph";
import { unwrapTuple } from "../tuple/UnwrapTupleCallback";

export default function getDef(graph: Graph) {
    return {
        'graph-tables(key) name schema': {
            name: 'GraphTables',
            'find': unwrapTuple(() => {
                const out = [];
                for (const mount of graph.tablesByName.values()) {
                    out.push({name: mount.name, schema: mount.schema.stringify()})
                }
                return out;
            })
        }
    }
}
