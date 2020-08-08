
import CommandExecutionParams from '../CommandExecutionParams'
import planQuery from '../planQuery'
import { insertOnOneTable } from './insert'
import { deleteOnOneTable } from './delete'
import { updatePlanned } from './update'
import Stream from '../Stream'
import Tuple from '../Tuple'
import TableMount from '../TableMount'
import findPartitionsByTable from '../findPartitionsByTable'
import { combineStreams } from '../StreamUtil'
import TupleTag, { newTag } from '../TupleTag'
import Graph from '../Graph'
import QueryPlan from '../QueryPlan'

function createImplicitTable(graph: Graph, tuple: Tuple) {
    const attrTags: TupleTag[] = []
    for (const tag of tuple.tags) {
        if (tag.attr)
            attrTags.push(newTag(tag.attr));
    }

    const tableName = '_' + attrTags.map(tag => tag.attr).join('_');
    const tablePattern = new Tuple(attrTags);
    // console.log(`created new implicit table ${tableName}: ${tablePattern.stringify()}`);
    return graph.defineInMemoryTable(tableName, tablePattern);
}

function setOnTable(graph: Graph, table: TableMount, tuple: Tuple, plan: QueryPlan, out: Stream) {
    // Check for a custom 'set' handler
    if (table.callWithDefiniteValues('set', tuple, out)) {
        return;
    }

    if (tuple.queryDerivedData().isDelete) {
        deleteOnOneTable(graph, table, tuple, out);
    } else if (tuple.queryDerivedData().isUpdate) {
        //updateOnOneTable(table, tuple, out);
        updatePlanned(graph, tuple, plan, out);
    } else {
        insertOnOneTable(graph, table, tuple, out);
    }
}

export default function set(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const { pattern } = command;

    const plan = planQuery(graph, pattern, output);
    if (plan.failed)
        return;

    const combinedOut = combineStreams(output);
    const allTables = combinedOut();

    let anyFound = false;
    for (const [table, partitionedTuple] of findPartitionsByTable(graph, plan.tuple)) {
        const tableOut = combinedOut();
        anyFound = true;
        setOnTable(graph, table, partitionedTuple, plan, tableOut);
    }

    if (!anyFound) {
        const table = createImplicitTable(graph, plan.tuple);
        setOnTable(graph, table, plan.tuple, plan, combinedOut());
    }

    allTables.done();
}
