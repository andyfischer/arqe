
import CommandExecutionParams from '../CommandExecutionParams'
import { update, del } from '../tableOperations'
import planQuery from '../planQuery'
import maybeCreateImplicitTable from '../maybeCreateImplicitTable'
import { insertPlanned } from './insert'

export default function set(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    maybeCreateImplicitTable(graph, plan);
        
    if (plan.isDelete) {
        del(graph, plan);
    } else if (plan.isUpdate) {
        update(graph, plan);
    } else {
        insertPlanned(graph, plan);
    }
}
