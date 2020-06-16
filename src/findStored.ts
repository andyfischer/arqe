
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
    searchTables?: Table[]
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

    for (const table of plan.searchTables) {
        yield* scanOneTable(table, searchPattern);
    }
}
