import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import QueryPlan from "../QueryPlan";
import { newTag } from "../PatternTag";
import planQuery from "../planQuery";
import CommandExecutionParams from '../CommandExecutionParams'
import TableStorage from "../TableStorage";
import { callNativeHandler } from "../NativeHandler";

export function deleteOnTable(graph: Graph, tuple: Tuple, table: TableStorage, out: Stream) {

    if (table.handlers) {
        const handler = table.handlers.find('delete', tuple);
        if (handler) {
            callNativeHandler(handler, tuple, out);
            return;
        }
    }
    
    table.delete(tuple, {
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
    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        deleteOnTable(graph, searchPattern, table.storage, collectOutput());
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
