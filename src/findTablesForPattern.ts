
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

function patternHasValuesFor(pattern: Tuple, requiredKeys: Tuple) {
    for (const tag of requiredKeys.tags)
        if (!pattern.hasValue(tag.attr))
            return false;
    return true;
}

export function findTablesWithKeyedAccess(graph: Graph, pattern: Tuple): TableMount[] {
    let tables: TableMount[] = [];
    
    // A table can be used for a pattern IF:
    //  - The pattern has EVERY attribute that is a required attribute on the table.
    //  - The pattern does not have any attributes that aren't on the table.
    //
    // The pattern might or might not have attributes that are non-key attributes on the table.
    
    for (const table of graph.tables()) {
        //console.log('looking at', table.schema.stringify())
        if (!table.requiredKeys) {
            throw new Error("table has no .requiredKeys?")
            continue;
        }

        // Pattern must have the required table keys.
        if (!patternHasAttrs(pattern, table.requiredKeys)) {
            // console.log('  missing values: ' + table.requiredKeys.stringify())
            continue;
        }

        // Table must have every required attribute on the pattern
        const patternRequired = pattern.filterTags(tag => !tag.optional);
        if (!patternHasAttrs(table.schema, patternRequired)) {
            continue;
        }

        tables.push(table);
    }

    return tables;
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

    // First look for a keyed access
    const keyedAccess = findTablesWithKeyedAccess(graph, pattern);

    if (keyedAccess.length > 0) {
        for (const table of keyedAccess) {
            yield [table, pattern];
        }
        return;
    }
}
