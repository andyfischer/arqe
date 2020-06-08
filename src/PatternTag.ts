
import { patternTagToString } from './stringifyQuery'

export interface PatternTagOptions {
    attr?: string
    tagValue?: string
    valueExpr?: string[]
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string
}

export default class PatternTag {
    attr?: string
    tagValue?: string
    valueExpr?: string[]
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string

    isFrozen?: boolean

    str() {
        return patternTagToString(this);
    }

    stringify() {
        return patternTagToString(this);
    }

    copy(): PatternTag {
        const tag = new PatternTag();
        tag.attr = this.attr;
        tag.tagValue = this.tagValue;
        tag.negate = this.negate;
        tag.star = this.star;
        tag.doubleStar = this.doubleStar;
        tag.starValue = this.starValue;
        tag.questionValue = this.questionValue;
        tag.identifier = this.identifier;
        return tag;
    }

    freeze() {
        if (this.isFrozen)
            return;
        
        this.isFrozen = true;
        Object.freeze(this);
        return this;
    }

    setValue(value: string): PatternTag {
        const out = this.copy();
        out.tagValue = value;
        delete out.starValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }

    setValueless(): PatternTag {
        const out = this.copy();
        delete out.tagValue;
        delete out.starValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }

    setStarValue(): PatternTag {
        const out = this.copy();
        out.starValue = true;
        delete out.tagValue;
        delete out.valueExpr;
        out.freeze();
        return out;
    }

    setIdentifier(id: string): PatternTag {
        const out = this.copy();
        out.identifier = id;
        out.freeze();
        return out;
    }

    removeIdentifier(): PatternTag {
        return this.setIdentifier(null);
    }

    setValueExpr(expr: string[]): PatternTag {
        const out = this.copy();
        out.valueExpr = expr;
        delete out.tagValue;
        // TODO: don't set starValue for expr
        out.starValue = true;
        return out;
    }

    compareCanonicalSort(rhs: PatternTag): number {
        if (this.doubleStar !== rhs.doubleStar)
            return boolCompare(this.doubleStar, rhs.doubleStar);

        if (this.star !== rhs.star)
            return boolCompare(this.star, rhs.star);

        if (this.attr !== rhs.attr)
            return stringCompare(this.attr, rhs.attr);

        if (this.starValue !== rhs.starValue)
            return boolCompare(this.starValue, rhs.starValue);

        if (this.questionValue !== rhs.questionValue)
            return boolCompare(this.questionValue, rhs.questionValue);

        if (this.negate !== rhs.negate)
            return boolCompare(this.negate, rhs.negate);
        
        if (this.tagValue !== rhs.tagValue)
            return stringCompare(this.tagValue, rhs.tagValue);

        if (this.star !== rhs.star)
            return boolCompare(this.star, rhs.star);

        return 0;
    }

    equals(rhs: PatternTag): boolean {
        return this.compareCanonicalSort(rhs) === 0;
    }
}

function stringCompare(a,b) {
    if (a < b)
        return -1;
    if (a !== b)
        return 1;
    return 0;
}

function boolCompare(a,b) {
    if (a)
        return -1;
    if (b)
        return 1;
    return 0;
}

export type FixedTag = PatternTag;

export function newTag(attr: string, tagValue?: string): PatternTag {
    const tag = new PatternTag();
    tag.attr = attr;
    tag.tagValue = tagValue;
    return tag;
}

export function newTagFromObject(obj: PatternTagOptions) {
    const tag = new PatternTag();
    for (const k in obj)
        tag[k] = obj[k];

    if (tag.tagValue === undefined)
        tag.tagValue = null;

    return tag;
}

