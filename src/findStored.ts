
import Tuple from './Tuple'
import TupleStore from './TupleStore'

type FindIterator = Iterable<{
    slotId:string,
    found: Tuple,
    tableName: string}>

interface PartialQueryPlan {
    tuple?: Tuple
    tableName?: string
    filterPattern?: Tuple
}

export default function* findStored(store: TupleStore, plan: PartialQueryPlan): FindIterator {

    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const tableName = plan.tableName;

    if (tableName) {
        const indexedStorageIds = store.byTableName[tableName] || {};

        for (const slotId in indexedStorageIds) {
            const found = store.slots[slotId];
            if (searchPattern.isSupersetOf(found))
                yield { slotId, found, tableName }
        }
        
        return;
    }

    // Full scan
    for (const slotId in store.slots) {
        const found = store.slots[slotId];
        if (searchPattern.isSupersetOf(found))
            yield { slotId, found, tableName }
    }
}
