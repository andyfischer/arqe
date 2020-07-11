
import Graph from './Graph'
import TupleTag from './TupleTag'
import Tuple from './Tuple'
import Stream from './Stream'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import QueryPlan, { QueryTag } from './QueryPlan'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import findTableForQuery from './findTableForQuery'
import { tupleToModification, expressionUpdatesExistingValue } from './TupleModification'

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


function getEffects(tuple: Tuple) {

    let isUpdate = false;
    let canInitializeMissing = true;

    for (const tag of tuple.tags) {
        const expr = tag.valueExpr;
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
        if (tag.valueExpr && tag.valueExpr[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.valueExpr[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });
}

function patternIsDelete(tuple: Tuple) {
    if (!tuple.hasAttr('deleted'))
        return false;

    const deletedExpr = tuple.getTagObject('deleted');
    if (deletedExpr && deletedExpr.valueExpr && deletedExpr.valueExpr[0] === 'set') {
        return true;
    }

    return false;
}

function modificationPatternToFilter(tuple: Tuple) {
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
    if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr))
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

function initialBuildQueryPlan(graph: Graph, tuple: Tuple, output: Stream) {

    const planTags = toPlanTags(graph, tuple);
    const { initializeIfMissing, isUpdate } = getEffects(tuple);

    let modification = null;

    if (isUpdate) {
        modification = tupleToModification(tuple);
    }

    const tableName = getImpliedTableName(tuple);

    const plan: QueryPlan = {
        tags: planTags,
        tuple,
        filterPattern: modificationPatternToFilter(tuple),
        singleStar: tuple.derivedData().hasSingleStar,
        doubleStar: tuple.derivedData().hasDoubleStar,
        isUpdate,
        modification,
        initializeIfMissing,
        isDelete: patternIsDelete(tuple),
        tableName,
        output,
        failed: false
    };

    return plan;
}

function validatePlan(plan: QueryPlan) {
    // There was once stuff here
}

export default function planQuery(graph: Graph, tuple: Tuple, output: Stream) {

    tuple = resolveImmediateExpressions(tuple);

    const plan: QueryPlan = initialBuildQueryPlan(graph, tuple, output);
    let table = null;

    try {
        table = findTableForQuery(graph, plan.filterPattern);
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
            .filter(table => table.storage.supportsCompleteScan);
    }

    validatePlan(plan);
    return plan;
}

