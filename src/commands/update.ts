
import CommandExecutionParams from '../CommandExecutionParams'
import { Graph, Tuple } from '..';
import QueryPlan from '../QueryPlan';
import { combineStreams } from '../StreamUtil';
import { toInitialization, insertPlanned } from './insert';
import planQuery from '../planQuery';

export function updatePlanned(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    let hasFoundAny = false;

    // Scan and apply the modificationCallback to every matching slot.

    const collectOutput = combineStreams({
        next: (t:Tuple) => {
            if (!t.isCommandMeta()) {
                hasFoundAny = true;
                graph.onTupleUpdated(t);
            }
            output.next(t);
        },
        done: () => {
            // Check if the plan has 'initializeIfMissing' - this means we must insert the row
            // if no matches were found.
            if (!hasFoundAny && plan.initializeIfMissing) {
                plan.tuple = toInitialization(plan.tuple);
                insertPlanned(graph, plan);
            } else {
                output.done();
            }
        }
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        table.storage.update(searchPattern, plan.modification, collectOutput());
    }

    allTables.done();
}

export default function updateCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    updatePlanned(graph, plan);
}
