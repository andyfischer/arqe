
import CommandExecutionParams from '../CommandExecutionParams'
import { update } from '../tableOperations'
import planQuery from '../planQuery'
import maybeCreateImplicitTable from '../maybeCreateImplicitTable'
import { insertPlanned } from './insert'
import { deletePlanned } from './delete'

export default function set(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    maybeCreateImplicitTable(graph, plan);
        
    if (plan.isDelete) {
        deletePlanned(graph, plan);
    } else if (plan.isUpdate) {
        update(graph, plan);
    } else {
        insertPlanned(graph, plan);
    }
}
