
import Graph from './Graph'
import Pattern from './Pattern'
import Table from './Table'

interface Success {
    table: Table
}

interface Failure {
    errorMessage: string
}


export default function findTableForPattern(graph: Graph, pattern: Pattern) {
    // Special case: pattern has declared 'table'
    if (pattern.hasType('table')) {
    }

    // Look at primary keys
    for (const tag of pattern.tags) {
        if (!tag.attr)
            continue;

        const table = this.findTable(tag.attr)
        if (!table)
            continue;

        for (const pk of table.possiblePrimaryKeys)
            if (pk.pattern.isSupersetOf(pattern))
                // Check if this pattern fits in the table (ie the pattern doesn't have any
                // extra attrs that aren't on the table)
                return pk;
    }

    return null;
}
