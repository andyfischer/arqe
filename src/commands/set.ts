
import CommandParams from '../CommandParams'
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
import QueryPlan from '../QueryPlan'
import { emitCommandError } from '../CommandMeta'
import QueryContext from '../QueryContext'

function createImplicitTable(cxt: QueryContext, tuple: Tuple) {
    const attrTags: TupleTag[] = []
    for (const tag of tuple.tags) {
        if (tag.attr)
            attrTags.push(newTag(tag.attr));
    }

    const tableName = '_' + attrTags.map(tag => tag.attr).join('_');
    const tablePattern = new Tuple(attrTags);

    cxt.msg("creating implicit table", { tableName })
    
    return cxt.graph.defineInMemoryTable(tableName, tablePattern);
}

function setOnTable(cxt: QueryContext, table: TableMount, tuple: Tuple, plan: QueryPlan, out: Stream) {
    // Check for a custom 'set' handler
    if (table.callWithDefiniteValues(cxt, 'set', tuple, out)) {
        return;
    }

    if (tuple.queryDerivedData().isDelete) {
        const deletePattern = tuple.removeAttr('deleted');
        deleteOnOneTable(cxt, table, deletePattern, out);
    } else if (tuple.queryDerivedData().isUpdate) {
        updatePlanned(cxt, tuple, plan, out);
    } else {
        insertOnOneTable(cxt, table, tuple, out);
    }
}

export default function set(cxt: QueryContext, params: CommandParams) {
    const { command, output } = params;
    const { pattern } = command;

    const plan = planQuery(null, pattern, output);
    if (plan.failed)
        return;

    const combinedOut = combineStreams(output);
    const allTables = combinedOut();

    let anyFound = false;
    for (const [table, partitionedTuple] of findPartitionsByTable(cxt, plan.tuple)) {
        const tableOut = combinedOut();
        anyFound = true;
        setOnTable(cxt, table, partitionedTuple, plan, tableOut);
    }

    if (!anyFound) {
        if (cxt.graph.options.autoinitMemoryTables) {
            const table = createImplicitTable(cxt, plan.tuple);
            setOnTable(cxt, table, plan.tuple, plan, combinedOut());
        } else {
            emitCommandError(output, "No table found for: " + pattern.stringify());
        }
    }

    allTables.done();
}
