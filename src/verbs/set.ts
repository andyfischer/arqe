
import CommandParams from '../CommandParams'
import { insertOnOneTable } from './insert'
import { deleteOnOneTable } from './delete'
import { updatePlanned } from './update'
import Stream from '../Stream'
import Tuple from '../Tuple'
import TableMount from '../TableMount'
import findTablesForPattern from '../findTablesForPattern'
import { combineStreams } from '../StreamUtil'
import TupleTag, { newTag } from '../TupleTag'
import { emitCommandError } from '../CommandUtils'
import QueryContext from '../QueryContext'

function setOnTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {
    // Check for a custom 'set' handler
    if (table.callWithDefiniteValues(cxt, 'set', tuple, out)) {
        // Done
    } else if (table.callWithDefiniteValues(cxt, 'save', tuple, out)) {
        // Also done
    } else if (tuple.queryDerivedData().isDelete) {
        const deletePattern = tuple.removeAttr('deleted');
        deleteOnOneTable(cxt, table, deletePattern, out);
    } else if (tuple.queryDerivedData().isUpdate) {
        updatePlanned(cxt, tuple, out);
    } else {
        insertOnOneTable(cxt, table, tuple, out);
    }

    table.pushChangeEvent(cxt);
}

export default function set(params: CommandParams) {
    const { tuple, output, scope } = params;

    const combinedOut = combineStreams(output);
    const allTables = combinedOut();

    let anyFound = false;
    for (const [table, partitionedTuple] of findTablesForPattern(scope.graph, tuple)) {
        const tableOut = combinedOut();
        anyFound = true;
        setOnTable(scope, table, partitionedTuple, tableOut);
    }

    if (!anyFound) {
        emitCommandError(output, "No table found for: " + tuple.stringify());
    }

    allTables.done();
}
