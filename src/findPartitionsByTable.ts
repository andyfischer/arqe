
import Graph from './Graph'
import Tuple from './Tuple'
import TableMount from './TableMount'

export default function *findPartitionsByTable(graph: Graph, tuple: Tuple): IterableIterator<[TableMount, Tuple]> {
    // Check if the query specifies an exact table
    if (tuple.hasAttr('table')) {
        const tableName = tuple.getVal('table');
        const table = graph.findTable(tableName);
        if (!table)
            throw new Error("table not found: " + tableName);

        yield [ table, tuple ];
        return;
    }

    // Check if the pattern matches a defined table
    let anyFound = false;
    for (const table of graph.tablePatternMap.findMulti(tuple)) {
        yield [ table, tuple ]
        anyFound = true;
    }

    if (!anyFound) {
        // (Deprecated?) Fall back to a full search
        for (const table of graph.tables.values()) {
            if (table.hasHandler('list-all', tuple)) {
                yield [ table, tuple ];
            }
        }
    }
}

