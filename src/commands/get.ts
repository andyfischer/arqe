
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import CommandExecutionParams from '../CommandExecutionParams'
import { select } from '../tableOperations'
import planQuery from '../planQuery'
import { emitSearchPatternMeta } from '../CommandMeta'

export default function get(graph: Graph, pattern: Tuple, output: Stream) {
    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    emitSearchPatternMeta(pattern, output);

    if (plan.storageProvider) {
        plan.storageProvider.runSearch(plan.tuple, plan.output);
    } else {
        select(graph, plan, output);
    }
}
