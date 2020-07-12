import CommandExecutionParams from '../CommandExecutionParams'
import { emitCommandError } from '../CommandMeta';
import Graph from '../Graph';
import Tuple from '../Tuple';
import QueryPlan from '../QueryPlan';
import { callNativeHandler } from '../NativeHandler';
import TableStorage from '../TableStorage';
import Stream from '../Stream';
import planQuery from '../planQuery';
import TupleTag from '../TupleTag';
import TableMount from '../TableMount';

export function insertOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    /*
    if (table.insert) {
        table.insert(tuple, out);
        return;
    }
    */

    const handler = table.handlers.find('insert', tuple);
    if (handler) {
        callNativeHandler(handler, tuple, out);
        return;
    }

    emitCommandError(out, "No insert handler found on table " + table.name);
    out.done();
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

export function insertPlanned(graph: Graph, plan: QueryPlan) {
    const { output } = plan; 

    // Store a new tuple.
    const table = plan.table;

    if (!plan.table)
        throw new Error("Internal error, missing table in insert()")

    if (!plan.tableName) {
        emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
        output.done();
        return;
    }

    const tuple = resolveExpressionValuesForInsert(graph, plan.tuple);

    insertOnTable(table, tuple, {
        next: t => {
            output.next(t);
        },
        done: () => {
            output.next(tuple);
            graph.onTupleUpdated(tuple);
            output.done();
        }
    });
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

    insertPlanned(graph, plan);
}
