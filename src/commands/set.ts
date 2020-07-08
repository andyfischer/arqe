
import CommandExecutionParams from '../CommandExecutionParams'
import planQuery from '../planQuery'
import maybeCreateImplicitTable from '../maybeCreateImplicitTable'
import { insertPlanned } from './insert'
import { deletePlanned } from './delete'
import { updatePlanned } from './update'

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
        updatePlanned(graph, plan);
    } else {
        insertPlanned(graph, plan);
    }
}
