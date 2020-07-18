
import CommandExecutionParams from '../CommandExecutionParams'
import planQuery from '../planQuery'
import maybeCreateImplicitTable from '../maybeCreateImplicitTable'
import { insertPlanned } from './insert'
import { deletePlanned } from './delete'
import { updatePlanned } from './update'
import Stream from '../Stream'
import Tuple from '../Tuple'
import TableMount from '../TableMount'
import { emitCommandError } from '../CommandMeta'

export function setOnTable(table: TableMount, tuple: Tuple, out: Stream) {
    if (table.call('set', tuple, out))
        return true;

    return false;
}

export default function set(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    maybeCreateImplicitTable(graph, plan);

    // Check for a custom 'set' handler
    if (plan.table) {
        if (plan.table.call('set', plan.tuple, output))
            return;
    }
        
    if (plan.isDelete) {
        deletePlanned(graph, plan);
    } else if (plan.isUpdate) {
        updatePlanned(graph, plan);
    } else {
        insertPlanned(graph, plan);
    }
}
