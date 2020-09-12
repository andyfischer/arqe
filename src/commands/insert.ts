import CommandExecutionParams from '../CommandParams'
import Graph from '../Graph';
import Tuple from '../Tuple';
import Stream from '../Stream';
import TupleTag from '../TupleTag';
import TableMount from '../TableMount';
import findPartitionsByTable from '../findPartitionsByTable';
import QueryContext from '../QueryContext';

export function insertOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {
    const uniqueTag = findUniqueTag(tuple);

    if (uniqueTag) {
        if (table.callInsertUnique(uniqueTag, tuple, out))
            return;
    }

    const resolvedTuple = resolveExpressionValuesForInsert(cxt.graph, tuple);

    table.callWithDefiniteValuesOrError(cxt, 'insert', resolvedTuple, {
        next: t => {
            out.next(t);
        },
        done: () => {
            cxt.graph.onTupleUpdated(resolvedTuple);
            out.done();
        }
    });
}

function resolveExpressionValuesForInsert(graph: Graph, tuple: Tuple) {

    for (let i=0; i < tuple.tags.length; i++) {
        const tag = tuple.tags[i];
        if (tag.exprValue && tag.exprValue[0] === 'unique') {
            const id = graph.takeNextUniqueIdForAttr(tag.attr);
            tuple = tuple.updateTagAtIndex(i, tag => tag.setValue(id));
        }
    }

    return tuple;
}

function findUniqueTag(tuple: Tuple) {
    for (const tag of tuple.tags)
        if (tag.exprValue && tag.exprValue[0] === 'unique')
            return tag;
    return null;
}

export function insertPlanned(cxt: QueryContext, tuple: Tuple, out: Stream) {
    // Store a new tuple.
    const partitions = Array.from(findPartitionsByTable(cxt, tuple));

    if (partitions.length === 0)
        throw new Error("Can't insert, no table found");

    if (partitions.length > 1)
        throw new Error("Can't insert, multiple tables found");

    const table = partitions[0][0];

    insertOnOneTable(cxt, table, tuple, out);
}

export function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: TupleTag) => {
        if (tag.exprValue && tag.exprValue[0] === 'set')
            return tag.setValue(tag.exprValue[1]);
        return tag;
    });
}

export default function insertCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { tuple, output } = params;

    insertPlanned(cxt, tuple, output);
}
