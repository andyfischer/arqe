
import TupleTag, { newTag } from './TupleTag'
import Tuple from './Tuple'
import TableMount from './TableMount'
import Graph from './Graph'

interface PartialQueryPlan {
    tuple?: Tuple
    filterPattern?: Tuple
    table?: TableMount
}

export default function maybeCreateImplicitTable(graph: Graph, plan: PartialQueryPlan) {
    if (plan.table)
        return;

    const tuple = plan.filterPattern || plan.tuple;

    const attrTags: TupleTag[] = []
    for (const tag of tuple.tags) {
        if (tag.attr)
            attrTags.push(newTag(tag.attr));
    }

    const tableName = '_' + attrTags.map(tag => tag.attr).join('_');
    const tablePattern = new Tuple(attrTags);
    // console.log(`created new implicit table ${tableName}: ${tablePattern.stringify()}`);
    plan.table = graph.defineInMemoryTable(tableName, tablePattern);
}
