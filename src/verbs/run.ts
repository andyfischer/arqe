
import CommandExecutionParams from '../CommandParams'
import Graph from '../Graph';
import Tuple from '../Tuple';
import Stream from '../Stream';
import Tag from '../Tag';
import TableMount from '../TableMount';
import findTablesForPattern from '../findTablesForPattern';
import QueryContext from '../QueryContext';
import { combineStreams } from '../StreamUtil'
import { emitCommandError } from '../CommandUtils'

export default function runCommand(params: CommandExecutionParams) {
    const { tuple, output, scope } = params;
    const combinedOut = combineStreams(output);
    const allTables = combinedOut();

    let foundCount = 0;
    for (const [table, partitionedTuple] of findTablesForPattern(scope.graph, tuple)) {
        const tableOut = combinedOut();
        foundCount += 1;

        if (!table.callWithDefiniteValues(scope, 'run', partitionedTuple, tableOut)) {
            emitCommandError(output, "Table doesn't have a 'run' handler: " + table.name);
        }
    }

    if (foundCount === 0) {
        emitCommandError(output, "No table found for: " + tuple.stringify())
    }

    allTables.done();
}
