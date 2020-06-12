
import Tuple from './Tuple'
import PatternTag from './PatternTag'

function expressionMatches(expr: string[], subExpr: string[]) {
    if (expr.length !== subExpr.length)
        return false;

    for (let i = 0; i < expr.length; i++) {
        if (typeof expr[i] !== 'string' || expr[i] !== subExpr[i])
            return false;
    }

    return true;
}

export default class MatchHelper {
    tuple: Tuple
    countsByAttr: { [attr: string]: { min: number, max?: number } } = {}
    valueTagsByAttr: { [ attr: string]: PatternTag[] } = {}

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

            if (tag.tagValue || tag.valueExpr) {
                this.valueTagsByAttr[attr].push(tag);
            }
        }
    }

    findMatchingFixedTag(valueTag: PatternTag, tags: PatternTag[]) {
        if (valueTag.tagValue) {
            for (const tag of tags) {
                if (tag.tagValue === valueTag.tagValue)
                    return true;
            }

            return false;
        }

        if (valueTag.valueExpr) {
            for (const tag of tags) {
                if (tag.valueExpr && expressionMatches(valueTag.valueExpr, tag.valueExpr))
                    return true;
            }

            return false;
        }
    }

    isSupersetCheckOneAttr(attr: string, subPattern: Tuple) {
        const thisTags = this.tuple.tagsByAttr[attr];
        const subTags = subPattern.tagsByAttr[attr];

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