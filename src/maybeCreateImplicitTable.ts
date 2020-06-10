
import PatternTag, { newTag } from './PatternTag'
import Tuple from './Tuple'
import TupleStore from './TupleStore'
import Table from './Table'

interface PartialQueryPlan {
    tuple?: Tuple
    filterPattern?: Tuple
    table?: Table
}

export default function maybeCreateImplicitTable(store: TupleStore, plan: PartialQueryPlan) {
    if (plan.table)
        return;

    const tuple = plan.tuple || plan.filterPattern;

    const attrTags: PatternTag[] = []
    for (const tag of tuple.tags) {
        if (tag.attr)
            attrTags.push(newTag(tag.attr));
    }

    const tableName = '_' + attrTags.map(tag => tag.attr).join('_');
    plan.table = store.defineTable(tableName, new Tuple(attrTags));
}
