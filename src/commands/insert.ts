import CommandExecutionParams from '../CommandExecutionParams'
import Graph from '../Graph';
import Tuple from '../Tuple';
import Stream from '../Stream';
import planQuery from '../planQuery';
import TupleTag from '../TupleTag';
import TableMount from '../TableMount';
import findPartitionsByTable from '../findPartitionsByTable';

export function insertOnOneTable(graph: Graph, table: TableMount, tuple: Tuple, out: Stream) {
    const uniqueTag = findUniqueTag(tuple);

    if (uniqueTag) {
        if (table.callInsertUnique(uniqueTag, tuple, out))
            return;
    }

    const resolvedTuple = resolveExpressionValuesForInsert(graph, tuple);

    table.callWithDefiniteValuesOrError('insert', resolvedTuple, {
        next: t => {
            out.next(t);
        },
        done: () => {
            graph.onTupleUpdated(resolvedTuple);
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

export function insertPlanned(graph: Graph, tuple: Tuple, out: Stream) {
    // Store a new tuple.
    const partitions = Array.from(findPartitionsByTable(graph, tuple));

    if (partitions.length === 0)
        throw new Error("Can't insert, no table found");

    if (partitions.length > 1)
        throw new Error("Can't insert, multiple tables found");

    const table = partitions[0][0];

    insertOnOneTable(graph, table, tuple, out);
}

export function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: TupleTag) => {
        if (tag.exprValue && tag.exprValue[0] === 'set')
            return tag.setValue(tag.exprValue[1]);
        return tag;
    });
}

export default function insertCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    insertPlanned(graph, plan.tuple, output);
}
