
import Graph from './Graph'
import Tuple from './Tuple'
import Stream from './Stream'
import { emitCommandError } from './CommandMeta'

export default function findTableForQuery(graph: Graph, tuple: Tuple, out: Stream) {
    // Check if the query specifies an exact table

    if (tuple.hasAttr('table')) {
        const tableName = tuple.getVal('table');
        const table = graph.tupleStore.findTable(tableName);
        if (!table) {
            emitCommandError(out, "table not found: " + tableName);
            return { failed: true }
        }

        return { table }
    }

    // Check if the pattern matches a defined table
    const table = graph.tupleStore.tablePatternMap.find(tuple);
    // console.log(`looking for table for ${tuple.stringify()}: ${!!table}`)
    if (table)
        return { table }

    return { table: null }
}

