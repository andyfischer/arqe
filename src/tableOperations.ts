
import Tuple, { objectToTuple } from './Tuple'
import Graph from './Graph'
import QueryPlan from './QueryPlan'
import PatternTag, { newTag } from './PatternTag'
import { emitCommandError } from './CommandMeta'
import TableInterface from './TableInterface'
import { combineStreams } from './StreamUtil'
import Stream from './Stream'
import NativeHandler from './NativeHandler'

function callNativeHandler(handler: NativeHandler, input: Tuple, out: Stream) {
    const inputObject = input.toObject();
    const result = handler.func(inputObject);

    function toOutputTuple(item) {
        let out = input;

        for (const k in item)
            out = out.setVal(k, item[k]);

        return out;
    }

    function finish(result) {
        if (Array.isArray(result)) {
            for (const item of result)
                out.next(toOutputTuple(item));
        } else {
            out.next(toOutputTuple(result));
        }

        out.done();
    }

    if (result.then)
        result.then(finish)
    else
        finish(result);
}

export function selectOnTable(table: TableInterface, tuple: Tuple, out: Stream) {
    if (table.select) {
        table.select(tuple, out);
        return;
    }

    if (table['search'])
        throw new Error('table should not have search: ' + table.name)

    if (table.handlers) {
        const getHandler = table.handlers.find(tuple.setVal('get', true));
        if (getHandler) {
            callNativeHandler(getHandler, tuple, out);
            return;
        }

        const selectHandler = table.handlers.find(tuple.setVal('select', true));
        if (selectHandler) {
            selectHandler.func(tuple, out);
            return;
        }
    }

    emitCommandError(out, "No select handler found on table " + table.name);
    out.done();
}

export function insertOnTable(table: TableInterface, tuple: Tuple, out: Stream) {
    if (table.insert) {
        table.insert(tuple, out);
        return;
    }

    if (table.handlers) {
        const handler = table.handlers.find(tuple.setVal('insert', true));
        if (handler) {
            callNativeHandler(handler, tuple, out);
            return;
        }
    }

    emitCommandError(out, "No insert handler found on table " + table.name);
    out.done();
}

export function select(graph: Graph, plan: QueryPlan, out: Stream) {
    const searchPattern = plan.filterPattern || plan.tuple;
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    const combined = combineStreams(out);
    const startedAllTables = combined();

    for (const table of plan.searchTables) {
        selectOnTable(table.storage, searchPattern, combined());
    }

    startedAllTables.done();
}

function resolveExpressionValuesForInsert(graph: Graph, tuple: Tuple) {

    for (let i=0; i < tuple.tags.length; i++) {
        const tag = tuple.tags[i];
        if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
            const id = graph.takeNextUniqueIdForAttr(tag.attr);
            tuple = tuple.updateTagAtIndex(i, tag => tag.setValue(id));
        }
    }

    return tuple;
}

export function insert(graph: Graph, plan: QueryPlan) {
    const { output } = plan; 

    // Store a new tuple.
    const table = plan.table;

    if (!plan.table)
        throw new Error("Internal error, missing table in insert()")

    if (!plan.tableName) {
        emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
        output.done();
        return;
    }

    const tuple = resolveExpressionValuesForInsert(graph, plan.tuple);

    insertOnTable(table.storage, tuple, {
        next: t => {
            output.next(t);
        },
        done: () => {
            output.next(tuple);
            graph.onTupleUpdated(tuple);
            output.done();
        }
    });
}

function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

export function update(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    let hasFoundAny = false;

    // Scan and apply the modificationCallback to every matching slot.

    const collectOutput = combineStreams({
        next: (t:Tuple) => {
            if (!t.isCommandMeta()) {
                hasFoundAny = true;
                graph.onTupleUpdated(t);
            }
            output.next(t);
        },
        done: () => {
            // Check if the plan has 'initializeIfMissing' - this means we must insert the row
            // if no matches were found.
            if (!hasFoundAny && plan.initializeIfMissing) {
                plan.tuple = toInitialization(plan.tuple);
                insert(graph, plan);
            } else {
                output.done();
            }
        }
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        table.storage.update(searchPattern, plan.modification, collectOutput());
    }

    allTables.done();
}

export function del(graph: Graph, plan: QueryPlan) {
    const { output } = plan;

    const collectOutput = combineStreams({
        next(t: Tuple) {
            graph.onTupleDeleted(t);
            const deletedMessage = t.addTagObj(newTag('deleted'));
            output.next(deletedMessage);
        },
        done: output.done
    });

    const searchPattern = plan.filterPattern || plan.tuple;

    const allTables = collectOutput();
    for (const table of plan.searchTables) {
        const tableOut = collectOutput();
        table.storage.delete(searchPattern, tableOut);
    }
    allTables.done();
}
