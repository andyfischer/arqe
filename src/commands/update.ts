
import CommandParams from '../CommandParams'
import { Graph, Tuple, Stream, emitCommandError } from '..';
import QueryPlan from '../QueryPlan';
import { combineStreams } from '../StreamUtil';
import { toInitialization, insertPlanned } from './insert';
import planQuery from '../planQuery';
import findPartitionsByTable from '../findPartitionsByTable';
import TableMount from '../TableMount';
import QueryContext from '../QueryContext';

export function updateOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {
    table.callWithDefiniteValuesOrError(cxt, 'update', tuple, out);
}

export function updatePlanned(cxt: QueryContext, tuple: Tuple, plan: QueryPlan, output: Stream) {
    let hasFoundAny = false;

    // Scan and apply the modificationCallback to every matching slot.
    const collectOutput = combineStreams({
        next: (t:Tuple) => {
            if (!t.isCommandMeta()) {
                hasFoundAny = true;
                cxt.graph.onTupleUpdated(t);
            }
            output.next(t);
        },
        done: () => {
            // Check if the tuple has 'initializeIfMissing' - this means we must insert the row
            // if no matches were found.
            if (!hasFoundAny && tuple.queryDerivedData().initializeIfMissing) {
                const initTuple = toInitialization(tuple);
                insertPlanned(cxt, initTuple, output);
            } else {
                output.done();
            }
        }
    });

    const allTables = collectOutput();

    for (const [table, partitionedTuple] of findPartitionsByTable(cxt, tuple)) {
        const tableOut = collectOutput();
        updateOnOneTable(cxt, table, partitionedTuple, tableOut);
    }

    allTables.done();
}

export default function updateCommand(cxt: QueryContext, params: CommandParams) {
    const { command, output } = params;
    const { pattern } = command;

    const plan = planQuery(null, pattern, output);
    if (plan.failed)
        return;

    updatePlanned(cxt, plan.tuple, plan, output);
}
