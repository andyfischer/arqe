
import Graph from './Graph'
import TupleTag from './TupleTag'
import Tuple from './Tuple'
import Stream from './Stream'
import QueryPlan, { QueryTag } from './QueryPlan'

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

function resolveImmediateExpressions(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.exprValue && tag.exprValue[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.exprValue[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });
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

function expressionUpdatesExistingValue(expr: string[]) {
    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.isUpdate;
}

function tagModifiesExistingRelations(tag: TupleTag) {
    if (tag.exprValue && expressionUpdatesExistingValue(tag.exprValue))
        return true;

    return false;
}


function validatePlan(plan: QueryPlan) {
    // There was once stuff here
}

export default function planQuery(graph: Graph, tuple: Tuple, output: Stream) {

    const originalTuple = tuple;
    tuple = resolveImmediateExpressions(tuple);

    const plan: QueryPlan = {
        tuple,
        originalTuple,
        output,
        failed: false
    };

    validatePlan(plan);
    return plan;
}