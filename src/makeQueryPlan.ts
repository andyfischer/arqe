
import Database from './Database'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import QueryPlan, { QueryTag } from './QueryPlan'

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

export default function patternToQueryPlan(database: Database, pattern: Pattern, output: RelationReceiver) {
    const schema = database.schema;

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

        const column = schema.initColumn(tag.tagType);
        
        planTags.push({
            tag,
            column,
            type: column.type
        });
    }

    const { initializeIfMissing, modifiesExisting } = getEffects(pattern);

    const plan: QueryPlan = {
        tags: planTags,
        views: [],
        objects: [],
        values: [],
        pattern,
        singleStar,
        doubleStar,
        modifiesExisting,
        initializeIfMissing,
        output
    };

    for (const tag of planTags) {
        if (tag.type === ViewColumn)
            plan.views.push(tag);
        else if (tag.type === ObjectColumn)
            plan.objects.push(tag);
        else if (tag.type === ValueColumn)
            plan.values.push(tag);
    }


    if (plan.views.length > 0)
        return plan;

    if (plan.values.length > 0) {
        plan.values.sort((a,b) => a.tag.tagType.localeCompare(b.tag.tagType));
    }

    return plan;
}
