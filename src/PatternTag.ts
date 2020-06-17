
import { patternTagToString } from './stringifyQuery'

export interface TagOptions {
    attr?: string
    tagValue?: string | true
    valueExpr?: string[]
    nativeVal?: any
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string
}

export default class PatternTag {
    attr?: string
    tagValue?: string
    valueExpr?: string[]
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string

    constructor(opts: TagOptions) {
        this.attr = opts.attr;
        this.tagValue = opts.tagValue as any;
        this.valueExpr = opts.valueExpr;
        this.star = opts.star;
        this.doubleStar = opts.doubleStar;
        this.starValue = opts.starValue;
        this.optional = opts.optional;
        this.identifier = opts.identifier;

        if (opts.tagValue === undefined || opts.tagValue === true)
            this.tagValue = null;
    }

    str() {
        return patternTagToString(this);
    }

    stringify() {
        return patternTagToString(this);
    }

    copy(): PatternTag {
        return new PatternTag(this);
    }

    setValue(value: string): PatternTag {
        return new PatternTag({
            ...this,
            tagValue: value,
            starValue: null,
            valueExpr: null,
        });
    }

    setValueless(): PatternTag {
        return new PatternTag({
            ...this,
            tagValue: null,
            starValue: null,
            valueExpr: null,
        });
    }

    setStarValue(): PatternTag {
        return new PatternTag({
            ...this,
            starValue: true,
            tagValue: null,
            valueExpr: null
        });
    }

    setIdentifier(id: string): PatternTag {
        return new PatternTag({
            ...this,
            identifier: id
        });
    }

    removeIdentifier(): PatternTag {
        return this.setIdentifier(null);
    }

    setValueExpr(expr: string[]): PatternTag {
        return new PatternTag({
            ...this,
            tagValue: null,
            valueExpr: expr
        });
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

        if (this.optional !== rhs.optional)
            return boolCompare(this.optional, rhs.optional);

        if (this.tagValue !== rhs.tagValue)
            return stringCompare(this.tagValue, rhs.tagValue);

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

export function newTag(attr: string, tagValue?: string | true): PatternTag {
    return new PatternTag({ attr, tagValue });
}

export function newTagFromObject(obj: TagOptions) {
    return new PatternTag(obj);
}

