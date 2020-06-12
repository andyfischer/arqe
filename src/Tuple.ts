
import Command from './Command'
import Graph from './Graph'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, patternTagToString, commandTagsToString } from './stringifyQuery'
import PatternTag, { newTag, FixedTag } from './PatternTag'
import TupleMatchHelper from './TupleMatchHelper'
import TupleDerivedData from './TupleDerivedData'

export default class Tuple {
    
    tags: PatternTag[] = []

    // derived data
    tagsByAttr: { [typename: string]: PatternTag[] } = {}
    byIdentifier: { [identifier: string]: PatternTag } = {}

    _asMap?: Map<string, PatternTag>
    _derivedData?: TupleDerivedData
    _matchHelper?: TupleMatchHelper

    constructor(tags: PatternTag[]) {
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;
        this.updateDerivedData();
        Object.freeze(this.tags);
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
            this._asMap = new Map();

            for (const tag of this.tags) {
                if (!tag.attr)
                    continue;

                //if (this._asMap.has(tag.attr))
                //    throw new Error("duplicate attrs not allowed: " + tag.attr);

                this._asMap.set(tag.attr, tag);
            }
        }

        return this._asMap;
    }

    updateDerivedData() {
        for (const tag of this.tags) {
            const { attr } = tag;

            if (attr) {
                if (!this.tagsByAttr[attr])
                    this.tagsByAttr[attr] = [];

                this.tagsByAttr[attr].push(tag);
            }

            if (tag.identifier)
                this.byIdentifier[tag.identifier] = tag;
        }
    }

    remapTags(func: (tag:PatternTag) => PatternTag) {
        const tags = this.tags.map(func)
            .filter(tag => tag);
        return new Tuple(tags);
    }

    modifyTagsList(func: (tags: PatternTag[]) => PatternTag[]) {
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

        if (subDerived.hasSingleStar && !thisDerived.hasSingleStar)
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

    formatRelationRelative(rel: Tuple) {
        const outTags = [];

        for (const tag of rel.tags) {
            if (this.derivedData().fixedTagsForAttr.has(tag.attr))
                continue;

            outTags.push(patternTagToString(tag));
        }

        const str = outTags.join(' ');
        return str;
    }

    hasAttr(attr: string) {
        return this.asMap().has(attr);
    }

    getOneTagForType(typeName: string): PatternTag {
        const tags = this.tagsByAttr[typeName];
        if (!tags)
            return null;

        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);

        return tags[0];
    }

    getTagObject(typeName: string): PatternTag {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error('tag not found for type: ' + typeName);

        return tag;
    }

    getTag(attr: string) {
        return this.getTagAsString(attr);
    }

    getTagAsString(typeName: string) {
        const tag = this.getOneTagForType(typeName);

        if (!tag)
            throw new Error('tag not found for type: ' + typeName);

        if (!tag.tagValue)
            return typeName;

        return typeName + '/' + tag.tagValue;
    }

    getVal(attr: string) {
        return this.asMap().get(attr).tagValue;
    }

    getTagValueOptional(typeName: string, defaultValue) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            return defaultValue;

        return tag.tagValue;
    }

    dropTagIndex(index: number) {
        if (index >= this.tags.length)
            throw new Error('index out of range: ' + index);

        return new Tuple(this.tags.slice(0,index).concat(this.tags.slice(index + 1)));
    }

    setTagValueAtIndex(index: number, value: any) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        tags[index].tagValue = value;

        return new Tuple(tags);
    }

    setVal(attr: string, value: string) {
        return this.setValueForType(attr, value);
    }

    setValueForType(attr: string, value: any) {

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
            out = out.addNewTag(attr, value);

        return out;
    }

    setTagValueForType(attr: string, value: any) {
        return this.setValueForType(attr, value);
    }

    findTagForType(attr: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].attr === attr)
                return this.tags[i];
        return null;
    }

    findTagWithType(attr: string) {
        return this.findTagForType(attr);
    }

    findTagIndexOfType(attr: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].attr === attr)
                return i;
        return -1;
    }

    updateTagOfType(attr: string, update: (t: PatternTag) => PatternTag) {
        const index = this.findTagIndexOfType(attr);
        if (index === -1)
            throw new Error('attr not found: ' + attr);
        return this.updateTagAtIndex(index, update);
    }

    updateTagAtIndex(index: number, update: (t: PatternTag) => PatternTag) {
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

    addTagStr(s: string) {
        return new Tuple(this.tags.concat([parseTag(s)]));
    }

    addTagObj(tag: PatternTag) {
        return new Tuple(this.tags.concat([tag]));
    }

    addNewTag(tagType: string, tagValue?: string) {
        return this.addTagObj(newTag(tagType, tagValue));
    }

    addTags(strs: string[]) {
        return new Tuple(this.tags.concat(strs.map(parseTag)));
    }

    str() {
        return commandTagsToString(this.tags);
    }

    stringify() {
        return commandTagsToString(this.tags);
    }

    stringifyRelation() {
        return this.stringify();
    }

    stringifyToCommand() {
        let commandPrefix = 'set ';

        return commandPrefix + this.stringifyRelation();
    }

    isCommandMeta() {
        return this.hasAttr('command-meta');
    }

    isCommandError() {
        return this.hasAttr('command-meta') && this.hasAttr('error');
    }
}

export function patternFromObject(object: { [k: string]: string }) {
    const tags = [];

    for (const key in object) {
        tags.push(newTag(key, object[key]));
    }

    return new Tuple(tags);
}

export function patternFromMap(map: Map<string,string>) {
    const tags = []
    for (const [key,value] of map.entries()) {
        const tag = new PatternTag({ attr: key, tagValue: value });
        tags.push(tag);
    }

    return new Tuple(tags);
}

export function tagsToPattern(tags: PatternTag[]): Tuple {
    return new Tuple(tags)
}


