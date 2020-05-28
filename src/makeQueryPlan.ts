
import Graph from './Graph'
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import RelationReceiver from './RelationReceiver'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import QueryPlan, { QueryTag } from './QueryPlan'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'

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

function getEffects(pattern: Pattern) {

    let modifiesExisting = false;
    let canInitializeMissing = true;

    for (const tag of pattern.tags) {
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

function resolveExpressions(pattern: Pattern) {
    return pattern.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.valueExpr[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });
}

function patternIsDelete(pattern: Pattern) {
    if (!pattern.hasType('deleted'))
        return false;

    const deletedExpr = pattern.getTagObject('deleted');
    if (deletedExpr && deletedExpr.valueExpr && deletedExpr.valueExpr[0] === 'set') {
        return true;
    }

    return false;
}

function modificationPatternToFilter(pattern: Pattern) {
    return pattern.remapTags((tag: PatternTag) => {
        if (tag.tagType === 'deleted')
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

function applyModification(changeOperation: Pattern, storedRel: Pattern): Pattern {

    storedRel = storedRel.remapTags((tag: PatternTag) => {
        const modificationTag = changeOperation.getOneTagForType(tag.tagType);

        if (expressionUpdatesExistingValue(modificationTag.valueExpr)) {
            tag = tag.setValue(applyModificationExpr(modificationTag.valueExpr, tag.tagValue));
        }

        return tag;
    });

    return storedRel;
}

function getImpliedTableName(pattern: Pattern) {
    for (const tag of pattern.tags)
        if (tag.star || tag.doubleStar)
            return null;
    
    const els = pattern.tags
        .filter(r => r.tagType !== 'deleted')
        .map(r => r.tagType);

    els.sort();
    return els.join(' ');
}

function initialBuildQueryPlan(graph: Graph, pattern: Pattern, output: RelationReceiver) {

    pattern = resolveExpressions(pattern);

    const planTags: QueryTag[] = [];

    let singleStar = false;
    let doubleStar = false;
    
    for (const tag of pattern.tags) {
        if (!tag.tagType) {
            if (tag.doubleStar) {
                doubleStar = true;
            } else if (tag.star) {
                singleStar = true;
            } else {
                throw new Error('what is this: ' + tag.stringify())
            }

            continue;
        }

        const column = graph.initColumn(tag.tagType);
        
        planTags.push({
            tag,
            column,
            type: column.type
        });
    }

    const { initializeIfMissing, modifiesExisting } = getEffects(pattern);

    let modificationCallback = null;
    if (modifiesExisting) {
        modificationCallback = (storedRel: Pattern) => {
            return applyModification(pattern, storedRel);
        }
    }

    const tableName = getImpliedTableName(pattern);

    const plan: QueryPlan = {
        tags: planTags,
        views: [],
        objects: [],
        values: [],
        pattern,
        filterPattern: modificationPatternToFilter(pattern),
        singleStar,
        doubleStar,
        modifiesExisting,
        modificationCallback,
        initializeIfMissing,
        isDelete: patternIsDelete(pattern),
        tableName,
        output
    };

    return plan;
}

function sortThroughTags(plan: QueryPlan) {
    // Sort tags by column type
    for (const tag of plan.tags) {
        if (tag.type === ViewColumn)
            plan.views.push(tag);
        else if (tag.type === ObjectColumn)
            plan.objects.push(tag);
        else if (tag.type === ValueColumn)
            plan.values.push(tag);
    }

    if (plan.values.length > 0) {
        plan.values.sort((a,b) => a.tag.tagType.localeCompare(b.tag.tagType));
    }

    // Check if any columns have a storageProvider. First one wins.
    for (const tag of plan.tags) {
        if (tag.column.storageProvider) {
            plan.storageProvider = tag.column.storageProvider;
            break;
        }
    }
}

function validatePlan(plan: QueryPlan) {
    if (plan.views.length > 2) {
        emitCommandError(plan.output, "query has multiple views");
        plan.output.finish();
        plan.passedValidation = false;
    }

    plan.passedValidation = true;
}

export default function patternToQueryPlan(graph: Graph, pattern: Pattern, output: RelationReceiver) {

    const plan: QueryPlan = initialBuildQueryPlan(graph, pattern, output);
    sortThroughTags(plan);
    validatePlan(plan);
    return plan;
}

