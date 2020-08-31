
import Graph from './Graph'
import Tuple from './Tuple'
import TableMount from './TableMount'
import tupleIntersection from './tuple/tupleIntersection';
import QueryContext from './QueryContext';

export default function *findPartitionsByTable(cxt: QueryContext, tuple: Tuple): IterableIterator<[TableMount, Tuple]> {
    cxt.start('findPartitionsByTable', { tuple: tuple.stringify() });

    const { graph } = cxt;

    // Check if the query specifies an exact table
    if (tuple.hasAttr('table')) {
        const tableName = tuple.getVal('table');
        const table = graph.findTable(tableName);
        if (!table)
            throw new Error("table not found: " + tableName);

        cxt.msg('found explicit table', { tableName });
        yield [ table, tuple ];
        cxt.end('findPartitionsByTable');
        return;
    }

    // Check if the pattern matches a defined table
    for (const table of graph.tablePatternMap.findOverlapTables(tuple)) {
        let partitionedTuple = tupleIntersection(tuple, table.schema)

        cxt.msg('found intersecting table', {
            tableName: table.name,
            partitionedTuple: partitionedTuple.stringify()
        });

        yield [ table, partitionedTuple ]
    }

    cxt.end('findPartitionsByTable');
}