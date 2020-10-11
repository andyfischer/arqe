/**
 TupleMatchHelper

 Helper functions and derived data for calculating isSupersetOf.

 This data is only needed for the X tuple in "x.isSupersetOf(y)"

*/

import Tuple from '../Tuple'
import TupleTag from '../TupleTag'

function expressionMatches(expr: string[], subExpr: string[]) {
    if (expr.length !== subExpr.length)
        return false;

    for (let i = 0; i < expr.length; i++) {
        if (typeof expr[i] !== 'string' || expr[i] !== subExpr[i])
            return false;
    }

    return true;
}

export default class TupleMatchHelper {
    tuple: Tuple
    countsByAttr: { [attr: string]: { min: number, max?: number } } = {}
    valueTagsByAttr: { [ attr: string]: TupleTag[] } = {}

    constructor(tuple: Tuple) {
        this.tuple = tuple;
        for (const tag of tuple.tags) {
            if (!tag.attr)
                continue;

            const attr = tag.attr;

            this.valueTagsByAttr[attr] = this.valueTagsByAttr[attr] || [];
            this.countsByAttr[attr] = this.countsByAttr[attr] || {
                min: 0,
                max: 0
            };

            if (tag.optional) {
                this.countsByAttr[attr].max += 1;
            } else {
                this.countsByAttr[attr].min += 1;
                this.countsByAttr[attr].max += 1;
            }

            if (tag.value || tag.exprValue) {
                this.valueTagsByAttr[attr].push(tag);
            }
        }

        Object.freeze(this.countsByAttr);
        Object.freeze(this.valueTagsByAttr);
        Object.freeze(this);
    }

    findMatchingFixedTag(valueTag: TupleTag, tags: TupleTag[]) {
        if (valueTag.value) {

            for (const tag of tags) {
                if (tag.value === valueTag.value)
                    return true;
            }

            return false;
        }

        if (valueTag.exprValue) {
            for (const tag of tags) {
                if (tag.exprValue && expressionMatches(valueTag.exprValue, tag.exprValue))
                    return true;
            }

            return false;
        }
    }

    isSupersetCheckOneAttr(attr: string, subPattern: Tuple) {
        const subTag = subPattern.asMap().get(attr);
        const subTags = subTag ? [subTag] : [];

        /*
        if (subTag && subTag.starValue && !this.starValueByAttr[attr]) {
            console.log(`(${this.tuple.stringify()}) is not a superset of (${subPattern.stringify()})`)
            return false;
        }
        */

        // Check min/max counts
        const { min, max } = this.countsByAttr[attr];

        const foundCount = subTags ? subTags.length : 0;

        if (foundCount < min)
            return false;

        if (foundCount > max)
            return false;

        for (const valueTag of this.valueTagsByAttr[attr]) {
            if (!this.findMatchingFixedTag(valueTag, subTags))
                return false;
        }

        return true;
    }
}
