import Graph from "../Graph";
import setupTableSet from "../setupTableSet";
import { unwrapTuple } from "../tuple/UnwrapTupleCallback";

export default function setupTables(graph: Graph) {
    return setupTableSet({
        'graph-tables name? schema?': {
            name: 'GraphTables',
            'list-all': unwrapTuple(() => {
                const out = [];
                for (const mount of graph.tables.values()) {
                    out.push({name: mount.name, schema: mount.schema.stringify()})
                }
                return out;
            })
        }
    });
}