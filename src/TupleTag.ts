
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

export default class TupleTag {
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

    fixedValue() {
        return !!this.tagValue;
    }

    str() {
        return patternTagToString(this);
    }

    stringify() {
        return patternTagToString(this);
    }

    copy(): TupleTag {
        return new TupleTag(this);
    }

    setValue(value: string): TupleTag {
        return new TupleTag({
            ...this,
            tagValue: value,
            starValue: null,
            valueExpr: null,
        });
    }

    setValueless(): TupleTag {
        return new TupleTag({
            ...this,
            tagValue: null,
            starValue: null,
            valueExpr: null,
        });
    }

    setStarValue(): TupleTag {
        return new TupleTag({
            ...this,
            starValue: true,
            tagValue: null,
            valueExpr: null
        });
    }

    setIdentifier(id: string): TupleTag {
        return new TupleTag({
            ...this,
            identifier: id
        });
    }

    removeIdentifier(): TupleTag {
        return this.setIdentifier(null);
    }

    setValueExpr(expr: string[]): TupleTag {
        return new TupleTag({
            ...this,
            tagValue: null,
            valueExpr: expr
        });
    }

    compareCanonicalSort(rhs: TupleTag): number {
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

    equals(rhs: TupleTag): boolean {
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

export type FixedTag = TupleTag;

export function newTag(attr: string, tagValue?: string | true): TupleTag {
    return new TupleTag({ attr, tagValue });
}

export function newTagFromObject(obj: TagOptions) {
    return new TupleTag(obj);
}

