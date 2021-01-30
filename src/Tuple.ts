
import Tag, { newSimpleTag, newTagFromObject, TagOptions,
    tagToJson, jsonToTag, nativeValueToTag, isTag } from './Tag'
import TupleMatchHelper from './tuple/TupleMatchHelper'
import TupleDerivedData from './tuple/TupleDerivedData'
import { symValueType } from './internalSymbols'
import TupleMap from './TupleMap'
import TupleQueryDerivedData from './tuple/TupleQueryDerivedData'

export default class Tuple {

    _s: string

    tags: Tag[] = []

    _asMap?: TupleMap
    _derivedData?: TupleDerivedData
    _matchHelper?: TupleMatchHelper
    _byIdentifier?: Map<string, Tag>
    _queryDerivedData?: TupleQueryDerivedData

    [symValueType] = 'tuple'

    constructor(tags: Tag[]) {
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;
        this._s = this.stringify();
        Object.freeze(this.tags);
    }

    isEmpty() {
        return this.tags.length === 0;
    }

    derivedData() {
        if (!this._derivedData)
            this._derivedData = new TupleDerivedData(this);
        return this._derivedData;
    }

    matchHelper() {
        if (!this._matchHelper)
            this._matchHelper = new TupleMatchHelper(this);
        return this._matchHelper;
    }

    getVerb(): string | null {
        if (this.tags.length === 0) {
            throw new Error("empty tag has no verb");
            return null;
        }

        return this.tags[0].attr;
    }


    asMap() {
        if (!this._asMap) {
            const newMap = new Map();

            for (const tag of this.tags) {
                if (!tag.attr)
                    continue;

                newMap.set(tag.attr, tag);
            }

            this._asMap = new TupleMap(newMap);
        }

        return this._asMap;
    }

    queryDerivedData() {
        if (!this._queryDerivedData)
            this._queryDerivedData = new TupleQueryDerivedData(this);
        return this._queryDerivedData;
    }

    *tagsIt() {
        for (const tag of this.tags) {
            yield tag;
        }
    }

    *attrs() {
        for (const tag of this.tags) {
            if (tag.attr)
                yield tag.attr;
        }
    }

    obj(): any {
        return this.toObject();
    }

    toObject(): any {
        const obj = {};

        for (const tag of this.tags) {
            if (!tag.attr)
                continue;

            obj[tag.attr] = tag.value;
        }

        return obj;
    }
    
    byIdentifier() {
        if (!this._byIdentifier) {
            this._byIdentifier = new Map();
            for (const tag of this.tags) {
                if (tag.identifier)
                    this._byIdentifier.set(tag.identifier, tag);
            }
        }
        return this._byIdentifier;
    }

    hasAnyIdentifier() {
        for (const t of this.tags)
            if (t.identifier)
                return true;
        return false;
    }

    *identifierTags() {
        for (const t of this.tags)
            if (t.identifier)
                yield t;
    }

    remapTags(func: (tag: Tag) => Tag) {
        const tags = this.tags.map(func)
            .filter(tag => tag);
        return new Tuple(tags);
    }

    filterTags(func: (tag: Tag) => boolean) {
        return new Tuple(this.tags.filter(func));
    }

    forEachTag(func: (tag: Tag) => void) {
        this.tags.forEach(func)
    }

    modifyTagsList(func: (tags: Tag[]) => Tag[]) {
        const tags = func(this.tags);
        return new Tuple(tags);
    }

    tagCount() {
        return this.tags.length;
    }

    isSupersetOf(subPattern: Tuple) {

        const matchHelper = this.matchHelper();
        const thisDerived = this.derivedData();
        const subDerived = subPattern.derivedData();

        if (subDerived.hasDoubleStar && !thisDerived.hasDoubleStar)
            return false;

        if (subDerived.hasSingleStar
                && !thisDerived.hasSingleStar
                && !thisDerived.hasDoubleStar)
            return false;

        // Check each attr
        for (const attr of this.asMap().keys()) {
            if (!matchHelper.isSupersetCheckOneAttr(attr, subPattern))
                return false;
        }
        
        // Check if subPattern has extra attrs that we don't have.
        if (!thisDerived.hasDoubleStar && !thisDerived.hasSingleStar) {
            for (const subAttr of subPattern.asMap().keys())
                if (!this.hasAttr(subAttr))
                    return false;
        }

        return true;
    }

    overlapCheckSingleAttr(lhsTag: Tag, rhs: Tuple) {
        const rhsTag = rhs.getTag(lhsTag.attr);
        if (!rhsTag) {
            // No corresponding tag found on rhs.

            if (lhsTag.optional)
                return true;

            return rhs.derivedData().hasDoubleStar;
        }

        // Check if either tag matches all values
        if (!lhsTag.hasValue() || !rhsTag.hasValue())
            return true;

        // Both sides have a definite value
        return lhsTag.value === rhsTag.value;
    }

    hasOverlap(rhs: Tuple) {
        // Check each lhs attribute
        for (const lhsTag of this.tags) {
            if (!lhsTag.attr)
                continue;
            if (!this.overlapCheckSingleAttr(lhsTag, rhs))
                return false;
        }

        // Check rhs attributes for any missing on lhs.
        for (const rhsTag of rhs.tags) {
            if (!rhsTag.attr)
                continue;

            if (rhsTag.optional)
                continue;

            if (!this.hasAttr(rhsTag.attr)
                    && !this.derivedData().hasDoubleStar) {
                return false;
            }
        }

        return true;
    }

    /*
     Look at every attr used in this tuple, and returns true if subTuple has a
     definite value for each attr.
    */
    checkRequiredValuesProvidedBy(subTuple: Tuple) {
        for (const tag of this.tags) {
            if (tag.exprValue)
                return false;
            const subTag = subTuple.getTag(tag.attr);
            if (!subTag || !subTag.hasValue())
                return false;
        }
        return true;
    }

    equals(rhs: Tuple) {
        if (this === rhs)
            return true;

        if (this.tags.length !== rhs.tags.length)
            return false;

        for (let i = 0; i < this.tags.length; i++) {
            const leftTag = this.derivedData().sortedTags[i];
            const rightTag = rhs.derivedData().sortedTags[i];
            if (!leftTag.equals(rightTag))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.derivedData().hasAnyStars;
    }

    hasAttr(attr: string) {
        return this.asMap().has(attr);
    }

    has(attr: string) {
        const tag = this.asMap().get(attr);
        return tag && tag.hasValue();
    }

    hasValue(attr: string) {
        return this.asMap().has(attr) && !!this.asMap().get(attr).value;
    }

    getTagObject(attr: string): Tag {
        return this.asMap().get(attr);
    }

    getTagAsString(attr: string) {
        const tag = this.getTagObject(attr);
        if (!tag.value)
            return attr;

        return attr + '/' + tag.value;
    }

    get(attr: string) {
        const tag = this.asMap().get(attr);

        if (!tag)
            throw new Error("attr not found: " + attr);

        if (!tag.hasValue())
            throw new Error("not a fixed value: " + attr);

        return tag.value;
    }

    getIndex(index: number): Tag {
        return this.tags[index] || null;
    }

    getVal(attr: string) {
        return this.get(attr);
    }

    getValue(attr: string) {
        return this.get(attr);
    }

    getInt(attr: string) {
        return parseInt(this.get(attr));
    }

    getOptional(attr: string, defaultValue) {
        if (this.asMap().has(attr)) {
            const tag = this.asMap().get(attr);
            if (!!tag.value)
                return tag.value;
        }

        return defaultValue;
    }

    getValByIdentifierOptional(identifierStr: string, defaultValue) {
        const tag = this.byIdentifier().get(identifierStr);
        if (tag && tag.value)
            return tag.value;
        return defaultValue;
    }

    deleteAtIndex(index: number) {
        if (index >= this.tags.length)
            throw new Error('index out of range: ' + index);

        return new Tuple(this.tags.slice(0,index).concat(this.tags.slice(index + 1)));
    }

    just(...attrs: string[]): Tuple {
        return this.filterTags(tag => attrs.indexOf(tag.attr) !== -1);
    }

    justAttrs(attrs: string[]) {
        const out: Tag[] = [];
        for (const attr of attrs)
            out.push(this.getTag(attr));
        return new Tuple(out);
    }

    justHoles() {
        return this.filterTags(tag => !tag.hasValue());
    }

    setVerb(attr: string) {
        return this.setTagAtIndex(0, newSimpleTag(attr));
    }

    setTagAtIndex(index: number, tag: Tag) {
        const tags = this.tags.map(t => t);
        tags[index] = tag;
        return new Tuple(tags);
    }

    setValueAtIndex(index: number, value: any) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].setValue(value);
        return new Tuple(tags);
    }

    setTag(tag: Tag) {
        if (this.hasAttr(tag.attr)) {
            return this.remapTags(existing => {
                if (existing.attr === tag.attr) {
                    return tag;
                } else {
                    return existing;
                }
            });
        } else {
            return this.addTag(tag);
        }
    }
    
    setVal(attr: string, value: any) {
        return this.setValue(attr, value);
    }

    setValue(attr: string, value: any) {
        if (!attr)
            throw new Error('setVal missing required: attr')

        let found = false;

        let out = this.remapTags(tag => {
            if (tag.attr === attr) {
                found = true;
                if (value === null)
                    return null;

                if (value === true)
                    return tag.dropValue();

                return tag.setValue(value);
            }
            return tag;
        });

        if (!found)
            out = out.addSimpleTag(attr, value);

        return out;
    }

    getTag(attr: string): Tag {
        return this.asMap().get(attr) || null;
    }

    updateTagOfType(attr: string, update: (t: Tag) => Tag) {
        return this.remapTags(tag => {
            if (tag.attr === attr)
                return update(tag);
            return tag;
        });
    }

    drop(attr: string) {
        return new Tuple(this.tags.filter(tag => tag.attr !== attr));
    }

    removeAttr(typeName: string) {
        return new Tuple(this.tags.filter(tag => tag.attr !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return new Tuple(this.tags.filter(tag => typeNames.indexOf(tag.attr) === -1));
    }

    removeTagAtIndex(index: number) {
        const tags = [];
        for (let i=0; i < this.tags.length; i++)
            if (i !== index)
                tags.push(this.tags[i]);
        return new Tuple(tags);
    }

    attrsOnly() {
        return this.remapTags(tag => {
            if (tag.attr)
                return newSimpleTag(tag.attr)
        });
    }

    addAttr(attr: string) {
        return this.addTag(newSimpleTag(attr));
    }

    addTag(tag: Tag) {
        if (!isTag(tag))
            throw new Error("not a valid tag: " + tag);

        return new Tuple(this.tags.concat([tag]));
    }

    copyTag(attr: string, tuple: Tuple) {
        return this.addTag(tuple.getTag(attr));
    }

    copyTagOptional(attr: string, tuple: Tuple) {
        if (tuple.hasAttr(attr)) {
            return this.addTag(tuple.getTag(attr));
        }
        return this;
    }

    addTags(tags: Tag[]) {
        return new Tuple(this.tags.concat(tags));
    }

    addSimpleTag(tagType: string, tagValue?: any) {
        return this.addTag(newSimpleTag(tagType, tagValue));
    }

    addNewTag(opts: TagOptions) {
        return this.addTag(new Tag(opts));
    }

    str() {
        return this.stringify();
    }

    stringify() {
        return this.tags.map(tag => tag.stringify()).join(' ');
    }

    toJson() {
        return tupleToJson(this);
    }

    isError() {
        return this.hasAttr('error');
    }

    isCommandMeta() {
        return this.hasAttr('command-meta');
    }

    isCommandError() {
        return this.hasAttr('command-meta') && this.hasAttr('error');
    }

    isCommandSearchPattern() {
        return this.hasAttr('command-meta') && this.hasAttr('search-pattern');
    }

    isAbstract() {
        return this.tags.length > 0 && this.tags[0].attr === 'abstract'
    }

    hasAnyAbstractValues() {
        for (const tag of this.tags)
            if (tag.isAbstractValue())
                return true;

        return false;
    }

    toProxyObject(): any {
        return new Proxy({}, {
            get: (target, prop) => {
                return this.getOptional(prop as any, undefined);
            }
        });
    }
}

export function objectToTuple(object: { [k: string]: any }) {
    const tags = [];

    for (const key in object) {
        tags.push(newSimpleTag(key, object[key]));
    }

    return new Tuple(tags);
}

export function newTuple(tags: Tag | Tag[]): Tuple {
    if (!Array.isArray(tags))
        tags = [tags];
    return new Tuple(tags)
}

export function singleTagToTuple(attr: string, value: any) {
    return new Tuple([newSimpleTag(attr, value)])
}

export function isTuple(val: any) {
    if (!val)
        return false;
    return val[symValueType] === 'tuple';
}

export function emptyTuple() {
    return new Tuple([]);
}

type PatternJSON = { [key: string]: any }

function oneKeyValueToTag(key: string, value: any) {
    if (key === '**') {
        return newTagFromObject({doubleStar: true});
    }

    if (key === '*') {
        return newTagFromObject({star: true});
    }

    if (Array.isArray(value)) {
        return value.map(valueEl => oneKeyValueToTag(key, valueEl));
    }

    if (value === true) {
        return newTagFromObject({attr: key});
    }
    
    if (value === null || value === undefined)
        return newTagFromObject({attr: key});

    if (typeof value === 'string')
        return newTagFromObject({attr: key, value: value});

    if (typeof value === 'number')
        return newTagFromObject({attr: key, value: value + ""});

    // Parse extended object
    let identifier = null;
    let attr = null;

    if (key[0] === '$') {
        identifier = key.slice(1);
    } else {
        attr = key;
    }

    if (value.attr)
        attr = value.attr;

    return newTagFromObject({
        attr,
        identifier,
        value: value.value,
        starValue: value.match === '*',
        optional: value.optional
    });
}

export function jsonToTuple(obj: PatternJSON): Tuple {

    if ((obj as any)[symValueType] !== undefined)
        throw new Error("parseObjectToPattern called on native type: " + (obj as any)[symValueType])

    let tags: Tag[] = [];

    for (const attr in obj) {
        if (attr === 'exprValue')
            throw new Error('object looks suspiciously like a Tag?? ' + JSON.stringify(obj));

        if (attr === '') {
            for (const jsonData of obj['']) {
                tags.push(jsonToTag(null, jsonData));
            }
            continue;
        }

        const jsonData = obj[attr];

        if (jsonData === false || jsonData === null) {
            continue;
        }

        tags.push(jsonToTag(attr, jsonData));
    }

    return newTuple(tags);
}

export function nativeValueToTuple(obj: any): Tuple {

    if ((obj as any)[symValueType] !== undefined)
        throw new Error("parseObjectToPattern called on native type: " + (obj as any)[symValueType])

    let tags: Tag[] = [];

    for (const attr in obj) {
        if (attr === 'exprValue')
            throw new Error('object looks suspiciously like a Tag?? ' + JSON.stringify(obj));

        const jsonData = obj[attr];

        if (jsonData === false || jsonData === null) {
            continue;
        }

        tags.push(nativeValueToTag(attr, jsonData));
    }

    return newTuple(tags);
}

export function tupleToJson(tuple: Tuple): PatternJSON {
    const out: PatternJSON = {}

    for (const tag of tuple.tags) {
        if (tag.attr) {
            out[tag.attr] = tagToJson(tag);
        } else {
            out[''] = out[''] || [];
            out[''].push(tag);
        }
    }

    return out;
}
