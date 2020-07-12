import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import QueryPlan from "../QueryPlan";
import { newTag } from "../TupleTag";
import planQuery from "../planQuery";
import CommandExecutionParams from '../CommandExecutionParams'
import { callNativeHandler } from "../NativeHandler";
import TableMount from "../TableMount";

export function deleteOnTable(graph: Graph, tuple: Tuple, table: TableMount, out: Stream) {

    const handler = table.handlers.find('delete', tuple);
    if (handler) {
        callNativeHandler(handler, tuple, out);
        return;
    }
    
    /*
    table.delete(tuple, {
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTagObj(newTag('deleted'));
            out.next(deletedMessage);
        },
        done: out.done
    });
    */
}

export function deletePlanned(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const collectOutput = combineStreams(output);
    const searchPattern = plan.tuple;

    console.log('deleting: ' + searchPattern.stringify())

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        const out = collectOutput();

        table.call('delete', searchPattern, {
            next(t: Tuple) {
                graph.onTupleDeleted(t);
                const deletedMessage = t.addTagObj(newTag('deleted'));
                out.next(deletedMessage);
            },
            done: out.done
        });
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
