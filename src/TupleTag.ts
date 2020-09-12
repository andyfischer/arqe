import { symValueStringify } from "./internalSymbols"
import { stringifyExpr } from "./parseExpr"


export interface TagOptions {
    attr?: string
    value?: string | number | true
    exprValue?: string[]
    nativeValue?: any
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string
}

export default class TupleTag {
    attr?: string
    value?: any
    nativeValue?: any
    // todo, store exprValue as a nativeValue
    exprValue?: string[]
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string

    constructor(opts: TagOptions) {
        this.attr = opts.attr;
        this.value = opts.value as any;
        this.exprValue = opts.exprValue;
        this.nativeValue = opts.nativeValue;
        this.star = opts.star;
        this.doubleStar = opts.doubleStar;
        this.starValue = opts.starValue;
        this.optional = opts.optional;
        this.identifier = opts.identifier;

        if (opts.value === undefined || opts.value === true)
            this.value = null;
    }

    hasValue() {
        return !!this.value;
    }

    hasIdentifier() {
        return !!this.identifier;
    }

    valueToString() {
        if (this.value == null)
            return '';
        const s = '' + this.value;
        if (s === '[object Object]' && typeof this.value !== 'string')
            return '<native object>'
        return s;
    }

    str() {
        return tagToString(this);
    }

    stringify() {
        return tagToString(this);
    }

    copy(): TupleTag {
        return new TupleTag(this);
    }

    setAttr(attr: string): TupleTag {
        return new TupleTag({
            ...this,
            attr
        });
    }

    setValue(value: string): TupleTag {
        return new TupleTag({
            ...this,
            value: value,
            starValue: null,
            exprValue: null,
            nativeValue: null
        });
    }

    setValueless(): TupleTag {
        return new TupleTag({
            ...this,
            value: null,
            starValue: null,
            exprValue: null,
            nativeValue: null
        });
    }

    setStarValue(): TupleTag {
        return new TupleTag({
            ...this,
            starValue: true,
            value: null,
            exprValue: null,
            nativeValue: null
        });
    }

    setNativeValue(v: any): TupleTag {
        return new TupleTag({
            ...this,
            starValue: true,
            value: null,
            exprValue: null,
            nativeValue: v
        })
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
            value: null,
            exprValue: expr,
            nativeValue: null
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

        if (this.value !== rhs.value)
            return stringCompare(this.value, rhs.value);

        return 0;
    }

    equals(rhs: TupleTag): boolean {
        return this.compareCanonicalSort(rhs) === 0;
    }

    isUniqueExpr() {
        return this.exprValue && this.exprValue[0] === 'unique';
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

export function newTag(attr: string, tagValue?: any): TupleTag {
    return new TupleTag({ attr, value: tagValue });
}

export function newSimpleTag(attr: string, tagValue?: any): TupleTag {
    if (!attr)
        throw new Error('missing required: attr')
    return new TupleTag({ attr, value: tagValue });
}

export function newTagFromObject(obj: TagOptions) {
    return new TupleTag(obj);
}


function tagValueNeedsParens(s: string) {
    for (let i = 0; i < s.length; i++)
        if (s.charAt(i) === ' ' || s.charAt(i) === '*' || s.charAt(i) === '/')
            return true;

    return false;
}

function valueToString(value: any): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number')
        return ''+value;

    if (typeof value === 'boolean')
        return ''+value;

    if (value[symValueStringify] !== undefined)
        return value[symValueStringify](value);

    return '<native>'
}

export function tagToString(tag: TupleTag) {
    if (tag.star && tag.identifier)
        return '$' + tag.identifier;

    if (tag.star)
        return '*';

    if (tag.doubleStar)
        return '**'

    if (tag.attr && tag.value === null && tag.identifier) {
        return tag.attr + '/$' + tag.identifier;
    }

    if (tag.value) {

        let s = '';

        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }

        let valStr = valueToString(tag.value);

        const needsParens = tagValueNeedsParens(valStr);

        if (needsParens) {
            s += tag.attr + '(';
        } else {
            s += tag.attr + '/';
        }

        s += valStr;

        if (needsParens)
            s += ')';

        return s;
    }

    if (tag.exprValue) {
        return tag.attr + '/' + stringifyExpr(tag.exprValue)

    } else if (tag.starValue) {
        return tag.attr + '/*';
    }

    if (tag.attr) {
        let s = '';
        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `
        }
        s += tag.attr;

        if (tag.optional)
            s += '?';

        return s;
    }
    
    throw new Error('unhandled case in patternTagToString: ' + JSON.stringify(tag));

    return ''
}
