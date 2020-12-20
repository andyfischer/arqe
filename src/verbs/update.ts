
import CommandParams from '../CommandParams'
import { Tuple, Stream } from '..';
import { combineStreams } from '../StreamUtil';
import { toInitialization, insertPlanned } from './insert';
import findTablesForPattern from '../findTablesForPattern';
import TableMount from '../TableMount';
import QueryContext from '../QueryContext';

export function updateOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {
    table.callWithDefiniteValuesOrError(cxt, 'update', tuple, out);
}

export function updatePlanned(cxt: QueryContext, tuple: Tuple, output: Stream) {
    let hasFoundAny = false;

    // Scan and apply the modificationCallback to every matching slot.
    const collectOutput = combineStreams({
        next: (t:Tuple) => {
            if (!t.isCommandMeta()) {
                hasFoundAny = true;
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

    for (const [table, partitionedTuple] of findTablesForPattern(cxt.graph, tuple)) {
        const tableOut = collectOutput();
        updateOnOneTable(cxt, table, partitionedTuple, tableOut);
    }

    allTables.done();
}

export default function updateCommand(cxt: QueryContext, params: CommandParams) {
    const { tuple, output } = params;

    updatePlanned(cxt, tuple, output);
}
