
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
}

export default function* findStored(store: TupleStore, plan: PartialQueryPlan): FindIterator {

    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const table = store.supertable;

    // Full scan
    for (const slotId in table.slots) {
        const found = table.slots[slotId];
        if (searchPattern.isSupersetOf(found))
            yield { slotId, found, table }
    }
}
