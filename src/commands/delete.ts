import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import QueryPlan from "../QueryPlan";
import { newTag } from "../TupleTag";
import planQuery from "../planQuery";
import CommandExecutionParams from '../CommandExecutionParams'
import TableMount from "../TableMount";

function deleteOnTable(graph: Graph, table: TableMount, pattern: Tuple, out: Stream) {

    table.callOrError('delete', pattern, {
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTagObj(newTag('deleted'));
            out.next(deletedMessage);
        },
        done: out.done
    });
}

export function deletePlanned(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const collectOutput = combineStreams(output);
    const searchPattern = plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        const tableOut = collectOutput();
        deleteOnTable(graph, table, searchPattern, tableOut);
    }

    allTables.done();
}

export default function deleteCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    let { pattern } = command;

    const deletePattern = pattern.addTagObj(newTag('deleted').setValueExpr(['set']));

    const plan = planQuery(graph, deletePattern, output);
    if (plan.failed)
        return;

    deletePlanned(graph, plan);
}
