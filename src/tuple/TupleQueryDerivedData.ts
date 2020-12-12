import Tuple, { isTuple } from "../Tuple";

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

function patternIsDelete(tuple: Tuple) {
    if (!tuple.hasAttr('deleted'))
        return false;

    const deletedExpr = tuple.getTagObject('deleted');
    if (deletedExpr && deletedExpr.exprValue && deletedExpr.exprValue[0] === 'set') {
        return true;
    }

    return false;
}

export default class TupleQueryDerivedData {
    isUpdate: boolean
    isDelete: boolean
    initializeIfMissing: boolean

    constructor(tuple: Tuple) {

        let isUpdate = false;
        let canInitializeMissing = true;

        for (const tag of tuple.tags) {

            let tagEffects = isTuple(tag.value)
                                     && (tag.value.tags.length > 0)
                                     && exprFuncEffects[tag.value.tags[0].attr];

            if (!tagEffects)
                continue;

            if (tagEffects.isUpdate)
                isUpdate = true;

            if (tagEffects.isUpdate && !tagEffects.canInitialize)
                canInitializeMissing = false;
        }

        let initializeIfMissing = isUpdate && canInitializeMissing;

        this.isUpdate = isUpdate;
        this.isDelete = patternIsDelete(tuple);
        this.initializeIfMissing = initializeIfMissing;

        Object.freeze(this);
    }
}
