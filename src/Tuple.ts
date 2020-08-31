
import TupleTag, { newSimpleTag, TagOptions } from './TupleTag'
import TupleMatchHelper from './tuple/TupleMatchHelper'
import TupleDerivedData from './tuple/TupleDerivedData'
import { symValueType } from './internalSymbols'
import TupleMap from './TupleMap'
import TupleQueryDerivedData from './tuple/TupleQueryDerivedData'

export default class Tuple {

    _s: string

    tags: TupleTag[] = []

    _asMap?: TupleMap
    _derivedData?: TupleDerivedData
    _matchHelper?: TupleMatchHelper
    _byIdentifier?: Map<string, TupleTag>
    _queryDerivedData?: TupleQueryDerivedData

    [symValueType] = 'tuple'

    constructor(tags: TupleTag[]) {
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;

        // debug only
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

    toObject() {
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

    remapTags(func: (tag:TupleTag) => TupleTag) {
        const tags = this.tags.map(func)
            .filter(tag => tag);
        return new Tuple(tags);
    }

    modifyTagsList(func: (tags: TupleTag[]) => TupleTag[]) {
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

    overlapCheckSingleAttr(lhsTag: TupleTag, rhs: Tuple) {
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
    checkDefiniteValuesProvidedBy(subTuple: Tuple) {
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

    hasValueForAttr(attr: string) {
        return this.asMap().has(attr) && !!this.asMap().get(attr).value;
    }

    getTagObject(attr: string): TupleTag {
        return this.asMap().get(attr);
    }

    getTagAsString(attr: string) {
        const tag = this.getTagObject(attr);
        if (!tag.value)
            return attr;

        return attr + '/' + tag.value;
    }

    getVal(attr: string) {
        const tag = this.asMap().get(attr);

        if (!tag)
            throw new Error("attr not found: " + attr);

        if (!tag.hasValue())
            throw new Error("not a fixed value: " + attr);

        return tag.value;
    }

    getNativeVal(attr: string) {
        const tag = this.asMap().get(attr);
        if (!tag.hasValue())
            throw new Error("not a fixed value: " + attr);
        return tag.nativeValue;
    }

    getValOptional(attr: string, defaultValue) {
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

    setValueAtIndex(index: number, value: any) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        tags[index].value = value;

        return new Tuple(tags);
    }

    setNativeVal(attr: string, value: any) {
        let found = false;

        let out = this.remapTags(tag => {
            if (tag.attr === attr) {
                found = true;
                return tag.setNativeValue(value);
            }
            return tag;
        });

        if (!found)
            out = out.addTag(newSimpleTag(attr, null).setNativeValue(value));

        return out; 
    }

    setVal(attr: string, value: any) {
        if (!attr)
            throw new Error('setVal missing required: attr')

        let found = false;

        let out = this.remapTags(tag => {
            if (tag.attr === attr) {
                found = true;
                if (value === null)
                    return null;

                if (value === true)
                    return tag.setValueless();

                return tag.setValue(value);
            }
            return tag;
        });

        if (!found)
            out = out.addSimpleTag(attr, value);

        return out;
    }

    getTag(attr: string): TupleTag {
        return this.asMap().get(attr) || null;
    }

    findTagIndex(attr: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].attr === attr)
                return i;
        return -1;
    }

    updateTagOfType(attr: string, update: (t: TupleTag) => TupleTag) {
        const index = this.findTagIndex(attr);
        if (index === -1)
            throw new Error('attr not found: ' + attr);
        return this.updateTagAtIndex(index, update);
    }

    updateTagAtIndex(index: number, update: (t: TupleTag) => TupleTag) {
        const tags = this.tags.map(t => t);
        tags[index] = update(tags[index]);
        return new Tuple(tags);
    }

    removeAttr(typeName: string) {
        return new Tuple(this.tags.filter(tag => tag.attr !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return new Tuple(this.tags.filter(tag => typeNames.indexOf(tag.attr) === -1));
    }

    addTag(tag: TupleTag) {
        return new Tuple(this.tags.concat([tag]));
    }

    addTags(tags: TupleTag[]) {
        return new Tuple(this.tags.concat(tags));
    }

    addSimpleTag(tagType: string, tagValue?: any) {
        return this.addTag(newSimpleTag(tagType, tagValue));
    }

    addNewTag(opts: TagOptions) {
        return this.addTag(new TupleTag(opts));
    }

    str() {
        return this.stringify();
    }

    stringify() {
        return this.tags.map(tag => tag.stringify()).join(' ');
    }

    getAttrToIndexMap() {
        const map = new Map<string,number>();
        for (let i = 0; i < this.tags.length; i++)
            map.set(this.tags[i].attr, i);
        return map;
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

    toProxyObject(): any {
        return new Proxy({}, {
            get: (target, prop) => {
                return this.getValOptional(prop as any, undefined);
            }
        });
    }
}

export function objectToTuple(object: { [k: string]: string | true }) {
    const tags = [];

    for (const key in object) {
        tags.push(newSimpleTag(key, object[key]));
    }

    return new Tuple(tags);
}

export function tagsToTuple(tags: TupleTag[]): Tuple {
    return new Tuple(tags)
}

export function singleTagToTuple(attr: string, value: any) {
    return new Tuple([newSimpleTag(attr, value)])
}
