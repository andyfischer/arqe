import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import TupleTag, { newTag } from "../TupleTag";
import CommandExecutionParams from '../CommandParams'
import TableMount from "../TableMount";
import findPartitionsByTable from "../findPartitionsByTable";
import QueryContext from "../QueryContext";

export function stripDeleteTag(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.attr === 'deleted')
            return null;
        return tag
    });
}

export function deleteOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {

    tuple = stripDeleteTag(tuple);

    table.callWithDefiniteValuesOrError(cxt, 'delete', tuple, {
        next(t: Tuple) {
            cxt.graph.onTupleDeleted(t);
            const deletedMessage = t.addTag(newTag('deleted'));
            out.next(deletedMessage);
        },
        done: out.done
    });
}

export function deletePlanned(cxt: QueryContext, searchPattern: Tuple, output: Stream) {
    const collectOutput = combineStreams(output);

    const allTables = collectOutput();
    for (const [table, tablePattern] of findPartitionsByTable(cxt, searchPattern)) {
        const tableOut = collectOutput();
        deleteOnOneTable(cxt, table, tablePattern, tableOut);

        table.pushChangeEvent(cxt);
    }

    allTables.done();
}

export default function deleteCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { tuple, output } = params;

    const deletePattern = tuple.addTag(newTag('deleted').setValueExpr(['set']));

    deletePlanned(cxt, tuple, output);
}
