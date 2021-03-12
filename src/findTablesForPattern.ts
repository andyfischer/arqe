
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

    // Check tables with star patterns. If one hits then it's the only match.
    for (const table of graph.tables()) {
        if (!table.matcher.matchesStar)
            continue;

        if (table.matcher.matches(pattern)) {
            yield [table, pattern];
            return;
        }
    }

    // Check non-star tables.
    for (const table of graph.tables()) {
        if (table.matcher.matchesStar)
            continue;

        if (table.matcher.matches(pattern))
            yield [table, pattern];
    }
}
