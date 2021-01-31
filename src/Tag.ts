import tagToString from './stringFormat/tagToString'
import Tuple, { isTuple, tupleToJson, jsonToTuple } from './Tuple'
import { symValueType } from './internalSymbols'

export interface TagOptions {
    attr?: string
    value?: any
    exprValue?: string[]
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string
}

export default class Tag {
    attr?: string
    value?: any
    exprValue?: string[]
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    optional?: boolean
    identifier?: string

    [symValueType] = 'tag'

    constructor(opts: TagOptions) {
        this.attr = opts.attr;

        if (opts.value === undefined) {
            this.value = null
        } else {
            this.value = opts.value as any;
        }

        this.exprValue = opts.exprValue;
        this.star = opts.star;
        this.doubleStar = opts.doubleStar;
        this.starValue = opts.starValue;
        this.optional = opts.optional;
        this.identifier = opts.identifier;
    }

    hasValue() {
        return this.value !== null;
    }

    hasIdentifier() {
        return !!this.identifier;
    }

    valueToString() {

        if (this.value === true)
            return 'true';

        if (this.value === false)
            return 'false';

        if (this.value == null)
            return '';

        const s = '' + this.value;

        if (isTuple(this.value))
            return '(' + this.value.stringify() + ')';

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

    copy(): Tag {
        return new Tag(this);
    }

    setAttr(attr: string): Tag {
        return new Tag({
            ...this,
            attr
        });
    }

    setVal(value: any) {
        return new Tag({
            ...this,
            value: value,
            starValue: null,
            exprValue: null,
        });
    }

    setValue(value: any): Tag {
        return new Tag({
            ...this,
            value: value,
            starValue: null,
            exprValue: null,
        });
    }

    dropValue(): Tag {
        return new Tag({
            ...this,
            value: null,
            starValue: null,
            exprValue: null,
        });
    }

    setStarValue(): Tag {
        return new Tag({
            ...this,
            starValue: true,
            value: null,
            exprValue: null,
        });
    }

    setIdentifier(id: string): Tag {
        return new Tag({
            ...this,
            identifier: id
        });
    }

    removeIdentifier(): Tag {
        return this.setIdentifier(null);
    }

    setValueExpr(expr: string[]): Tag {
        return new Tag({
            ...this,
            value: null,
            exprValue: expr,
        });
    }

    compareCanonicalSort(rhs: Tag): number {
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

    isAbstractValue() {
        return isTuple(this.value) && this.value.isAbstract();
    }

    isTupleValue() {
        return isTuple(this.value)
    }

    isStringValue() {
        return typeof (this.value) === 'string';
    }

    getTupleVerb(): string | null {
        return (this.isTupleValue() && (this.value as Tuple).getVerb()) || null;
    }

    equals(rhs: Tag): boolean {
        return this.compareCanonicalSort(rhs) === 0;
    }

    remapValue(callback: (v: any) => any) {
        return this.setValue(callback(this.value));
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

export function newTag(attr: string, tagValue?: any): Tag {
    return new Tag({ attr, value: tagValue });
}

export function newSimpleTag(attr: string, tagValue?: any): Tag {
    if (!attr)
        throw new Error('missing required: attr')
    return new Tag({ attr, value: tagValue });
}

export function newTagFromObject(obj: TagOptions) {
    return new Tag(obj);
}

export function tagToJson(tag: Tag) {

    if (tag.doubleStar) {
        return { match: '**' }
    }

    if (tag.star) {
        return { match: '*' }
    }

    let shouldUseExtended = false;

    if (tag.identifier) {
        shouldUseExtended = true;
    }

    if (tag.optional || tag.starValue || isTuple(tag.value))
        shouldUseExtended = true;

    if (shouldUseExtended) {

        let details: any = {};

        if (tag.starValue)
            details.match = "*";

        if (tag.hasValue()) {
            if (isTuple(tag.value)) {
                details.tuple = tupleToJson(tag.value)
            } else {
                details.value = tag.value;
            }
        }

        if (tag.identifier)
            details.identifier = tag.identifier;

        if (tag.optional)
            details.optional = true;

        return details;
    }

    if (tag.hasValue()) {
        return { value: tag.value }
    } else {
        return null;
    }
}

export function nativeValueToTag(attr: string, jsonData: any): Tag {
    if (jsonData === true)
        return newTagFromObject({attr, value: true});

    if (jsonData === false)
        return newTagFromObject({attr, value: false});
    
    if (jsonData === null || jsonData === undefined)
        return newTagFromObject({attr});

    if (typeof jsonData === 'string')
        return newTagFromObject({attr, value: jsonData});

    if (typeof jsonData === 'number')
        return newTagFromObject({attr, value: jsonData + ""});

    if (isTag(jsonData))
        return jsonData;

    return newTagFromObject({attr, value: jsonData});
}

export function jsonToTag(attr: string, jsonData: any): Tag {
    if (jsonData === true)
        return newTagFromObject({attr});
    
    if (jsonData === null || jsonData === undefined)
        return newTagFromObject({attr});

    if (typeof jsonData === 'string')
        return newTagFromObject({attr, value: jsonData});

    if (typeof jsonData === 'number')
        return newTagFromObject({attr, value: jsonData + ""});

    if (isTag(jsonData))
        return jsonData;

    if (isTuple(jsonData))
        return newTagFromObject({attr, value: jsonData});

    if (typeof jsonData === 'function')
        return newTagFromObject({attr, value: jsonData});

    // Extended format

    let value;

    if (jsonData.tuple)
        value = jsonToTuple(jsonData.tuple);
    else
        value = jsonData.value;

    const newTag = newTagFromObject({
        attr,
        value,
        identifier: jsonData.identifier,
        star: jsonData.star,
        doubleStar: jsonData.doubleStar,
        starValue: jsonData.match === '*',
        optional: jsonData.optional
    });

    // Internal test
    try {
        newTag.stringify()
    } catch (err) {
        throw new Error("jsonToTag created a tag that can't be stringifed: " + JSON.stringify(jsonData))
    }
    
    return newTag;
}

export function isTag(val: any) {
    return val && (val[symValueType] === 'tag');
}
