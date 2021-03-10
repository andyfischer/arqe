
import Graph from './Graph'
import Tuple from './Tuple'
import TableMount from './TableMount'
import tupleIntersection from './tuple/tupleIntersection';

function patternHasAttrs(pattern: Tuple, requiredKeys: Tuple) {
    for (const tag of requiredKeys.tags)
        if (!pattern.hasAttr(tag.attr))
            return false;
    return true;
}

export function *findTablesMatchingRequiredFields(graph: Graph, pattern: Tuple) {
    let tables: TableMount[] = [];
    
    // A table can be used for a pattern IFF:
    //  - The pattern has EVERY required table attribute.
    //  - The pattern has NO attributes that are outside the table.
    //
    // The pattern can optionally have attributes that are non-required on the table.
    
    for (const table of graph.tables()) {
        if (table.matcher.matches(pattern))
            yield table;
    }
}

export default function *findTablesForPattern(graph: Graph, pattern: Tuple): IterableIterator<[TableMount, Tuple]> {
    // Check if the query specifies an exact table
    if (pattern.hasAttr('table')) {
        const tableName = pattern.getVal('table');
        const table = graph.findTableByName(tableName);
        if (!table)
            throw new Error("table not found: " + tableName);

        yield [ table, pattern ];
        return;
    }

    for (const tableMount of findTablesMatchingRequiredFields(graph, pattern)) {
        //pattern = tableMount.matcher.transformInputForStar(pattern);
        //console.log(`found table ${tableMount.schema.stringify()}, pattern = `, pattern.stringify())
        yield [tableMount, pattern];
    }
}
