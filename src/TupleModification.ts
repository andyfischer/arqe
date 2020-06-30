
import Tuple from './Tuple'

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

export default class TupleModification {
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

export function tupleToModification(tuple: Tuple) {
    const mod = new TupleModification();

    for (const tag of tuple.tags) {
        if (tag.valueExpr && expressionUpdatesExistingValue(tag.valueExpr)) {
            mod.addAttrModification(tag.attr, getCallbackForExpression(tag.valueExpr));
        }
    }

    return mod;
}

export function expressionUpdatesExistingValue(expr: string[]) {
    const effects = expr && expr[0] && exprFuncEffects[expr[0]];
    return effects && effects.isUpdate;
}
