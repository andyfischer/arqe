
import CommandExecutionParams from '../CommandExecutionParams'
import { Graph, Tuple, Stream, emitCommandError } from '..';
import QueryPlan from '../QueryPlan';
import { combineStreams } from '../StreamUtil';
import { toInitialization, insertPlanned } from './insert';
import planQuery from '../planQuery';
import findPartitionsByTable from '../findPartitionsByTable';
import TableMount from '../TableMount';

export function updateOnOneTable(table: TableMount, tuple: Tuple, out: Stream) {
    table.callWithDefiniteValuesOrError('update', tuple, out);
}

export function updatePlanned(graph: Graph, tuple: Tuple, plan: QueryPlan, output: Stream) {
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
            // Check if the tuple has 'initializeIfMissing' - this means we must insert the row
            // if no matches were found.
            if (!hasFoundAny && tuple.queryDerivedData().initializeIfMissing) {
                const initTuple = toInitialization(tuple);
                insertPlanned(graph, initTuple, output);
            } else {
                output.done();
            }
        }
    });

    const allTables = collectOutput();

    for (const [table, partitionedTuple] of findPartitionsByTable(graph, tuple)) {
        const tableOut = collectOutput();
        updateOnOneTable(table, partitionedTuple, tableOut);
    }

    allTables.done();
}

export default function updateCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    updatePlanned(graph, plan.tuple, plan, output);
}
