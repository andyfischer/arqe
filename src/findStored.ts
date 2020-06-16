
import Tuple from './Tuple'
import TupleStore from './TupleStore'
import Table from './Table'

type FindIterator = Iterable<{
    slotId:string,
    found: Tuple,
    table: Table
}>

interface PartialQueryPlan {
    tuple?: Tuple
    filterPattern?: Tuple
    table?: Table
}

function* scanOneTable(table: Table, searchPattern: Tuple): FindIterator {
    for (const { slotId, tuple } of table.scanSlots()) {
        if (searchPattern.isSupersetOf(tuple))
            yield { slotId, found: tuple, table }
    }
}

export default function* findStored(store: TupleStore, plan: PartialQueryPlan): FindIterator {

    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const { table } = plan;
    if (table) {
        // One table scan
        yield* scanOneTable(table, searchPattern);
    } else {
        // Multi table scan
        for (const tableName in store.tables) {
            const table = store.tables[tableName];
            yield* scanOneTable(table, searchPattern);
        }
    }
}
