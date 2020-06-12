
import Graph from './Graph'
import PatternTag from './PatternTag'
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import QueryPlan, { QueryTag } from './QueryPlan'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import findTableForQuery from './findTableForQuery'

const exprFuncEffects = {
    increment: {
        modifiesExisting: true,
        canInitialize: false
    },
    set: {
        modifiesExisting: true,
        canInitialize: true
    }
};

function expressionUpdatesExistingValue(expr: string[]) {
    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.modifiesExisting;
}

function getEffects(tuple: Tuple) {

    let modifiesExisting = false;
    let canInitializeMissing = true;

    for (const tag of tuple.tags) {
        const expr = tag.valueExpr;
        const tagEffects = expr && expr[0] && exprFuncEffects[expr[0]];

        if (!tagEffects)
            continue;

        if (tagEffects.modifiesExisting)
            modifiesExisting = true;

        if (tagEffects.modifiesExisting && !tagEffects.canInitialize)
            canInitializeMissing = false;
    }

    let initializeIfMissing = modifiesExisting && canInitializeMissing;

    return {
        modifiesExisting,
        initializeIfMissing
    }
}

function resolveImmediateExpressions(tuple: Tuple) {
    return tuple.remapTags((tag: PatternTag) => {
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
    return tuple.remapTags((tag: PatternTag) => {
        if (tag.attr === 'deleted')
            return null;

        if (tagModifiesExistingRelations(tag))
            return tag.setStarValue()
        else
            return tag;
    });
}

function tagModifiesExistingRelations(tag: PatternTag) {
    if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr))
        return true;

    return false;
}

function applyModificationExpr(expr: string[], value: string) {
    switch (expr[0]) {
    case 'increment':
        return parseInt(value, 10) + 1 + '';

    case 'set':
        return expr[1];
    }
}

function applyModification(changeOperation: Tuple, storedRel: Tuple): Tuple {

    storedRel = storedRel.remapTags((tag: PatternTag) => {
        const modificationTag = changeOperation.getTagObject(tag.attr);

        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }

        return tag;
    });

    return storedRel;
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

        const column = graph.initColumn(tag.attr);
        
        planTags.push({
            tag,
            column,
            type: column.type
        });
    }

    return planTags;
}

function initialBuildQueryPlan(graph: Graph, tuple: Tuple, output: TupleReceiver) {

    const planTags = toPlanTags(graph, tuple);
    const { initializeIfMissing, modifiesExisting } = getEffects(tuple);

    let modificationCallback = null;
    if (modifiesExisting) {
        modificationCallback = (storedRel: Tuple) => {
            return applyModification(tuple, storedRel);
        }
    }

    const tableName = getImpliedTableName(tuple);

    const plan: QueryPlan = {
        tags: planTags,
        tuple,
        filterPattern: modificationPatternToFilter(tuple),
        singleStar: tuple.derivedData().hasSingleStar,
        doubleStar: tuple.derivedData().hasDoubleStar,
        modifiesExisting,
        modificationCallback,
        initializeIfMissing,
        isDelete: patternIsDelete(tuple),
        tableName,
        output,
        failed: false
    };

    return plan;
}

function findStorageProvider(plan: QueryPlan) {

    // Check if any columns have a storageProvider. First one wins.
    for (const tag of plan.tags) {
        if (tag.column.storageProvider) {
            plan.storageProvider = tag.column.storageProvider;
            break;
        }
    }
}

function validatePlan(plan: QueryPlan) {
    // There was once something here
}

export default function patternToQueryPlan(graph: Graph, tuple: Tuple, output: TupleReceiver) {

    tuple = resolveImmediateExpressions(tuple);

    const plan: QueryPlan = initialBuildQueryPlan(graph, tuple, output);
    const { table, failed } = findTableForQuery(graph, plan.filterPattern, output);

    if (failed) {
        plan.failed = true;
        return plan;
    }

    plan.table = table;

    findStorageProvider(plan);
    validatePlan(plan);
    return plan;
}

