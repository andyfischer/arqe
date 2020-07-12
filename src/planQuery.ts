
import Graph from './Graph'
import TupleTag from './TupleTag'
import Tuple from './Tuple'
import Stream from './Stream'
import QueryPlan, { QueryTag } from './QueryPlan'
import { emitCommandError } from './CommandMeta'
import findTableForQuery from './findTableForQuery'
import { expressionUpdatesExistingValue } from './TupleModification'
import { parsePattern } from './Pattern'

const exprFuncEffects = {
    increment: {
        isUpdate: true,
        canInitialize: false
    },
    set: {
        isUpdate: true,
        canInitialize: true
    }
};

const doubleStar = parsePattern('**');

function getEffects(tuple: Tuple) {

    let isUpdate = false;
    let canInitializeMissing = true;

    for (const tag of tuple.tags) {
        const expr = tag.exprValue;
        const tagEffects = expr && expr[0] && exprFuncEffects[expr[0]];

        if (!tagEffects)
            continue;

        if (tagEffects.isUpdate)
            isUpdate = true;

        if (tagEffects.isUpdate && !tagEffects.canInitialize)
            canInitializeMissing = false;
    }

    let initializeIfMissing = isUpdate && canInitializeMissing;

    return {
        isUpdate,
        initializeIfMissing
    }
}

function resolveImmediateExpressions(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.exprValue && tag.exprValue[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.exprValue[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });
}

function patternIsDelete(tuple: Tuple) {
    if (!tuple.hasAttr('deleted'))
        return false;

    const deletedExpr = tuple.getTagObject('deleted');
    if (deletedExpr && deletedExpr.exprValue && deletedExpr.exprValue[0] === 'set') {
        return true;
    }

    return false;
}

export function modificationPatternToFilter(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.attr === 'deleted')
            return null;

        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue()
        else
            return tag;
    });
}

function tagModifiesExistingRelations(tag: TupleTag) {
    if (tag.exprValue && expressionUpdatesExistingValue(tag.exprValue))
        return true;

    return false;
}

function getImpliedTableName(tuple: Tuple) {
    for (const tag of tuple.tags)
        if (tag.star || tag.doubleStar)
            return null;
    
    const els = tuple.tags
        .filter(r => r.attr !== 'deleted')
        .map(r => r.attr);

    els.sort();
    return els.join(' ');
}

function toPlanTags(graph: Graph, tuple: Tuple) {
    const planTags: QueryTag[] = [];

    for (const tag of tuple.tags) {
        if (!tag.attr) {
            continue;
        }

        planTags.push({
            tag
        });
    }

    return planTags;
}

export function stripDeleteTag(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.attr === 'deleted')
            return null;
        return tag
    });
}

function validatePlan(plan: QueryPlan) {
    // There was once stuff here
}

export default function planQuery(graph: Graph, tuple: Tuple, output: Stream) {

    const originalTuple = tuple;
    tuple = resolveImmediateExpressions(tuple);

    const planTags = toPlanTags(graph, tuple);
    const { initializeIfMissing, isUpdate } = getEffects(tuple);

    const isDelete = patternIsDelete(tuple);
    if (isDelete) {
        tuple = stripDeleteTag(tuple);
    }

    const tableName = getImpliedTableName(tuple);

    const plan: QueryPlan = {
        tags: planTags,
        tuple,
        originalTuple,
        singleStar: tuple.derivedData().hasSingleStar,
        doubleStar: tuple.derivedData().hasDoubleStar,
        isUpdate,
        initializeIfMissing,
        isDelete,
        tableName,
        output,
        failed: false
    };

    let table = null;

    try {
        table = findTableForQuery(graph, tuple);
    } catch (e) {
        emitCommandError(plan.output, e);
        plan.failed = true;
        return plan;
    }

    plan.table = table;

    if (table) {
        plan.searchTables = [table];
    } else {
        // Scan every table.
        plan.searchTables = Array.from(graph.tables.values())
            .filter(table => table.hasHandler('select', doubleStar));
    }

    validatePlan(plan);
    return plan;
}

