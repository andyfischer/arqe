
import Command from './Command'
import Graph from './Graph'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, patternTagToString, commandTagsToString } from './stringifyQuery'
import PatternTag, { newTag, FixedTag } from './PatternTag'
import TupleMatchHelper from './TupleMatchHelper'

export default class Tuple {
    
    tags: PatternTag[] = []

    // derived data
    minimumTagCount: number
    sortedTags: PatternTag[] = null
    hasDerivedData: boolean
    starValueTags: PatternTag[] = []
    fixedTags: FixedTag[] = []
    fixedTagsForType: { [typename: string]: true } = {}
    tagsByAttr: { [typename: string]: PatternTag[] } = {}
    hasStar?: boolean
    hasDoubleStar?: boolean
    byIdentifier: { [identifier: string]: PatternTag } = {}
    matchHelper?: TupleMatchHelper

    constructor(tags: PatternTag[]) {
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;
        this.updateDerivedData();
        Object.freeze(this.tags);
    }

    getSortedTags() {
        if (this.sortedTags === null) {
            const sortedTags = this.tags.concat([]);
            sortedTags.sort((a, b) => a.compareCanonicalSort(b));
            this.sortedTags = sortedTags;
        }
        return this.sortedTags;
    }

    getMatchHelper() {
        if (!this.matchHelper)
            this.matchHelper = new TupleMatchHelper(this);
        return this.matchHelper;
    }

    updateDerivedData() {
        if (this.hasDerivedData)
            return;

        let minimumTagCount = 0;

        for (const tag of this.tags) {
            const { attr } = tag;

            if (attr) {
                if (!this.tagsByAttr[attr])
                    this.tagsByAttr[attr] = [];

                this.tagsByAttr[attr].push(tag);
            }

            if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.star) {
                this.hasStar = true;

            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedTags.push(tag as FixedTag);
                this.fixedTagsForType[tag.attr] = true;
            }

            if (!tag.doubleStar && !tag.optional)
                minimumTagCount += 1;

            if (tag.identifier)
                this.byIdentifier[tag.identifier] = tag;
        }

        this.hasDerivedData = true;
        this.minimumTagCount = minimumTagCount;
    }

    copyWithNewTags(tags: PatternTag[]) {
        const pattern = new Tuple(tags);
        return pattern;
    }

    remapTags(func: (tag:PatternTag) => PatternTag) {
        const tags = this.tags.map(func)
            .filter(tag => tag);
        return this.copyWithNewTags(tags);
    }

    modifyTagsList(func: (tags: PatternTag[]) => PatternTag[]) {
        const tags = func(this.tags);
        return this.copyWithNewTags(tags);
    }

    tagCount() {
        return this.tags.length;
    }

    isSupersetOf(subPattern: Tuple) {

        const matchHelper = this.getMatchHelper();

        if (subPattern.hasDoubleStar && !this.hasDoubleStar)
            return false;

        if (subPattern.hasStar && !this.hasStar)
            return false;

        // Check each attr
        for (const attr in this.tagsByAttr) {
            if (!matchHelper.isSupersetCheckOneAttr(attr, subPattern))
                return false;
        }
        
        // Check if subPattern has extra attrs that we don't have.
        if (!this.hasDoubleStar && !this.hasStar) {
            for (const subAttr in subPattern.tagsByAttr)
                if (!this.tagsByAttr[subAttr])
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
            const leftTag = this.getSortedTags()[i];
            const rightTag = rhs.getSortedTags()[i];
            if (!leftTag.equals(rightTag))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }

    formatRelationRelative(rel: Tuple) {
        const outTags = [];

        for (const tag of rel.tags) {
            if (this.fixedTagsForType[tag.attr])
                continue;

            outTags.push(patternTagToString(tag));
        }

        const str = outTags.join(' ');
        return str;
    }

    hasType(typeName: string) {
        // TODO delete
        return !!this.tagsByAttr[typeName];
    }

    hasAttr(typeName: string) {
        return !!this.tagsByAttr[typeName];
    }

    hasValueForType(typeName: string) {
        if (!this.hasType(typeName))
            return false;

        for (const tag of this.tagsByAttr[typeName])
            if (tag.tagValue != null)
                return true;

        return false;
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

    getTag(typeName: string) {
        const tag = this.getOneTagForType(typeName);

        if (!tag)
            throw new Error('tag not found for type: ' + typeName);

        if (!tag.tagValue)
            return typeName;

        return typeName + '/' + tag.tagValue;
    }

    getTagString(typeName: string) {
        return this.getTag(typeName);
    }

    getValueForType(typeName: string) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error(`type "${typeName}" not found in pattern: ${this.stringify()}`);

        return tag.tagValue;
    }

    getVal(attr: string) {
        return this.getValueForType(attr);
    }

    getTagValue(typeName: string) {
        // TODO: replace with getVal
        return this.getValueForType(typeName);
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

        return this.copyWithNewTags(this.tags.slice(0,index).concat(this.tags.slice(index + 1)));
    }

    setTagValueAtIndex(index: number, value: any) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        tags[index].tagValue = value;

        return this.copyWithNewTags(tags);
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
        return this.copyWithNewTags(tags);
    }

    removeAttr(typeName: string) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.attr !== typeName));
    }

    removeType(typeName: string) {
        // TODO - remove
        return this.copyWithNewTags(this.tags.filter(tag => tag.attr !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return this.copyWithNewTags(this.tags.filter(tag => typeNames.indexOf(tag.attr) === -1));
    }

    addTagStr(s: string) {
        return this.copyWithNewTags(this.tags.concat([parseTag(s)]));
    }

    addTagObj(tag: PatternTag) {
        return this.copyWithNewTags(this.tags.concat([tag]));
    }

    addNewTag(tagType: string, tagValue?: string) {
        return this.addTagObj(newTag(tagType, tagValue));
    }

    addTags(strs: string[]) {
        return this.copyWithNewTags(this.tags.concat(strs.map(parseTag)));
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
        return this.hasType('command-meta');
    }

    isCommandError() {
        return this.hasType('command-meta') && this.hasType('error');
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


