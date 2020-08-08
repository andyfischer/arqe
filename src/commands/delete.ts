import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import TupleTag, { newTag } from "../TupleTag";
import planQuery from "../planQuery";
import CommandExecutionParams from '../CommandExecutionParams'
import TableMount from "../TableMount";
import findPartitionsByTable from "../findPartitionsByTable";

export function stripDeleteTag(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.attr === 'deleted')
            return null;
        return tag
    });
}

export function deleteOnOneTable(graph: Graph, table: TableMount, tuple: Tuple, out: Stream) {

    tuple = stripDeleteTag(tuple);

    table.callWithDefiniteValuesOrError('delete', tuple, {
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTag(newTag('deleted'));
            out.next(deletedMessage);
        },
        done: out.done
    });
}

export function deletePlanned(graph: Graph, searchPattern: Tuple, output: Stream) {
    const collectOutput = combineStreams(output);

    const allTables = collectOutput();
    for (const [table, tablePattern] of findPartitionsByTable(graph, searchPattern)) {
        const tableOut = collectOutput();
        deleteOnOneTable(graph, table, tablePattern, tableOut);
    }

    allTables.done();
}

export default function deleteCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    let { pattern } = command;

    const deletePattern = pattern.addTag(newTag('deleted').setValueExpr(['set']));

    const plan = planQuery(graph, deletePattern, output);
    if (plan.failed)
        return;

    deletePlanned(graph, plan.tuple, output);
}
