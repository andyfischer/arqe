import { combineStreams } from "../StreamUtil";
import { Graph, Tuple } from "..";
import QueryPlan from "../QueryPlan";
import { newTag } from "../PatternTag";
import planQuery from "../planQuery";
import CommandExecutionParams from '../CommandExecutionParams'

export function deletePlanned(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const collectOutput = combineStreams({
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTagObj(newTag('deleted'));
            output.next(deletedMessage);
        },
        done: output.done
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        const tableOut = collectOutput();
        table.storage.delete(searchPattern, tableOut);
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
