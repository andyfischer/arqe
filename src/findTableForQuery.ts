
import Graph from './Graph'
import Tuple from './Tuple'
import Stream from './Stream'
import { emitCommandError } from './CommandMeta'
import TableMount from './TableMount'

export default function findTableForQuery(graph: Graph, tuple: Tuple): TableMount {
    // Check if the query specifies an exact table
    if (tuple.hasAttr('table')) {
        const tableName = tuple.getVal('table');
        const table = graph.findTable(tableName);
        if (!table) {
            throw new Error("table not found: " + tableName);
        }

        return table;
    }

    // Check if the pattern matches a defined table
    const table = graph.tablePatternMap.find(tuple);
    // console.log(`looking for table for ${tuple.stringify()}: ${!!table}`)
    if (table)
        return table;

    return null;
}

