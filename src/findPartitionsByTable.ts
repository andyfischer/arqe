
import Graph from './Graph'
import Tuple from './Tuple'
import TableMount from './TableMount'
import tupleIntersection from './tuple/tupleIntersection';

export default function *findPartitionsByTable(graph: Graph, tuple: Tuple): IterableIterator<[TableMount, Tuple]> {
    // Check if the query specifies an exact table
    if (tuple.hasAttr('table')) {
        const tableName = tuple.getVal('table');
        const table = graph.findTableByName(tableName);
        if (!table)
            throw new Error("table not found: " + tableName);

        yield [ table, tuple ];
        return;
    }

    // Check if the pattern matches a defined table
    for (const table of graph.tablePatternMap.findOverlapTables(tuple)) {
        let partitionedTuple = tupleIntersection(tuple, table.schema)

        yield [ table, partitionedTuple ]
    }
}
