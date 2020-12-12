
import Tuple, { isTuple } from './Tuple'
import TupleTag from './TupleTag'


interface ExactTranslation {
    from: Tuple
    to: Tuple
}

type AttrFunc = (string) => string

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

class TupleModification {
    exactTranslations: ExactTranslation[] = []

    attrModifications: Map<string, AttrFunc>

    addAttrModification(attr: string, func: AttrFunc) {
        if (!this.attrModifications)
            this.attrModifications = new Map();

        this.attrModifications.set(attr, func);
    }

    apply(tuple: Tuple) {
        for (const [attr, func] of this.attrModifications.entries()) {
            tuple = tuple.setVal(attr, func(tuple.getVal(attr)));
        }
        return tuple;
    }
}

function getCallbackForExpression(expr: string[]) {
    switch (expr[0]) {
    case 'increment':
        return value => parseInt(value, 10) + 1 + '';

    case 'set':
        return _ => expr[1];
    }
}

function getUpdateExpression(updateExpr: Tuple) {
    if (updateExpr.tags.length === 0)
        return null;

    switch (updateExpr.tags[0].attr) {
    case 'increment':
        return {
            callback: value => parseInt(value, 10) + 1 + ''
        }

    case 'set':
        return {
            callback: _ => updateExpr.tags[1].attr
        }
    }

    return null;
}

export function tupleToModification(tuple: Tuple) {
    const mod = new TupleModification();

    for (const tag of tuple.tags) {
        const found = isTuple(tag.value) && getUpdateExpression(tag.value);
        if (found) 
            mod.addAttrModification(tag.attr, found.callback);
    }

    return mod;
}

export function expressionUpdatesExistingValue(expr: string[]) {
    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.isUpdate;
}

function tagModifiesExistingRelations(tag: TupleTag) {
    const found = isTuple(tag.value) && getUpdateExpression(tag.value);
    if (found) 
        return true;

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
