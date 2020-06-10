
import Graph from './Graph'
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'
import { emitCommandError } from './CommandMeta'

export default function findTableForQuery(graph: Graph, tuple: Tuple, out: TupleReceiver) {
    // Check if the query specifies an exact table

    if (tuple.hasType('table')) {
        const tableName = tuple.getValueForType('table');
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

