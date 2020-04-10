
import Command from './Command'
import Graph from './Graph'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, commandTagToString, commandTagsToString } from './stringifyQuery'
import PatternTag, { FixedTag } from './PatternTag'

export class PatternValue implements Pattern {
    
    tags: PatternTag[] = []

    // relation data
    payload: string | null
    payloadUnavailable?: true

    // derived data
    hasDerivedData: boolean
    starValueTags: PatternTag[] = []
    fixedTags: FixedTag[] = []
    fixedTagsForType: { [typename: string]: true } = {}
    tagsForType: { [typename: string]: PatternTag[] } = {}
    hasStar?: boolean
    hasDoubleStar?: boolean
    ntag?: string
    byIdentifier: { [identifier: string]: PatternTag } = {}

    constructor(tags: PatternTag[]) {
        this.tags = tags;
        this.updateDerivedData();
    }

    updateDerivedData() {
        if (this.hasDerivedData)
            return;

        for (const tag of this.tags) {
            const { tagType } = tag;

            if (!this.tagsForType[tagType])
                this.tagsForType[tagType] = [];

            this.tagsForType[tagType].push(tag);

            if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.star) {
                this.hasStar = true;
            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedTags.push(tag as FixedTag);
                this.fixedTagsForType[tag.tagType] = true;
            }

            if (tag.identifier)
                this.byIdentifier[tag.identifier] = tag;
        }

        this.hasDerivedData = true;
    }

    copyWithNewTags(tags: PatternTag[]) {
        const pattern = new PatternValue(tags);
        pattern.payload = this.payload;
        pattern.payloadUnavailable = this.payloadUnavailable;
        return pattern;
    }

    getNtag() {
        if (this.ntag == null)
            this.ntag = normalizeExactTag(this.tags);

        return this.ntag;
    }

    tagCount() {
        return this.tags.length;
    }

    hasPayload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");

        return this.payload != null;
    }

    getValue() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");

        return this.payload;
    }

    getPayload() {
        return this.getValue();
    }

    setValue(payload: any) {
        if (payload === '#exists') {
            throw new Error("don't use #exists as payload");
            payload = null;
        }

        this.payload = payload;
    }

    setPayload(payload: string | null) {
        this.setValue(payload);
        return this;
    }

    isSupersetOf(subPattern: Pattern) {
        if (this.hasDoubleStar)
            return true;

        if (this.tagCount() !== subPattern.tagCount())
            return false;

        for (const tag of this.tags) {

            let foundMatch = false;

            if (tag.star)
                continue;

            for (const subTag of (subPattern.tagsForType[tag.tagType] || [])) {

                if (!subTag)
                    return false;

                if (tag.starValue)
                    foundMatch = true;
                else if (subTag.starValue)
                    return false;

                if (tag.tagValue === subTag.tagValue)
                    foundMatch = true;
            }

            if (!foundMatch)
                return false;
        }

        return true;
    }

    matches(rel: Pattern) {

        // Check tag count on this relatino.
        if (this.hasDoubleStar) {
            if (rel.tagCount() < this.tagCount())
                return false;
        } else {
            if (rel.tagCount() !== this.tagCount())
                return false;
        }

        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedTags) {

            if (!rel.hasType(arg.tagType))
                return false;
            
            if (!arg.tagValue) {
                if (!rel.hasType(arg.tagType))
                    return false;

                if (rel.hasValueForType(arg.tagType))
                    return false;

                continue;
            }

            if (rel.getTagValue(arg.tagType) !== arg.tagValue)
                return false;
        }

        // For all star values: Check that the relation has a tag of this type.
        for (const arg of this.starValueTags) {
            if (!rel.hasType(arg.tagType))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }

    formatRelationRelative(rel: Pattern) {
        const outTags = [];

        for (const tag of rel.tags) {
            if (this.fixedTagsForType[tag.tagType])
                continue;

            outTags.push(commandTagToString(tag));
        }

        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');
        return str;
    }

    hasType(typeName: string) {
        return !!this.tagsForType[typeName];
    }

    hasValueForType(typeName: string) {
        if (!this.hasType(typeName))
            return false;

        for (const tag of this.tagsForType[typeName])
            if (tag.tagValue != null)
                return true;

        return false;
    }

    getOneTagForType(typeName: string): PatternTag {
        const tags = this.tagsForType[typeName];
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

    getTagValue(typeName: string) {
        const tag = this.getOneTagForType(typeName);
        if (!tag)
            throw new Error(`type "${typeName}" not found in pattern: ${this.stringify()}`);

        return tag.tagValue;
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

    findTagIndexOfType(tagType: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].tagType === tagType)
                return i;
        return -1;
    }

    updateTagAtIndex(index: number, update: (t: PatternTag) => void) {
        const tags = this.tags.map(t => t);
        tags[index] = tags[index].copy();
        update(tags[index]);
        return this.copyWithNewTags(tags);
    }

    removeType(typeName: string) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.tagType !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return this.copyWithNewTags(this.tags.filter(tag => typeNames.indexOf(tag.tagType) === -1));
    }

    addTag(s: string) {
        return this.copyWithNewTags(this.tags.concat([parseTag(s)]));
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
        const payloadStr = (this.payload != null) ? (' == ' + this.payload) : '';
        return this.stringify() + payloadStr;
    }

    stringifyToCommand() {
        let commandPrefix = 'set ';

        return commandPrefix + this.stringifyRelation();
    }
}

export default interface Pattern {
    tags: PatternTag[]
    tagCount: () => number
    fixedTags: FixedTag[]
    starValueTags: PatternTag[]
    tagsForType: { [typename: string]: PatternTag[] }
    byIdentifier: { [identifier: string]: PatternTag }
    hasType: (t: string) => boolean

    getNtag: () => string
    getTag: (t: string) => string
    getTagValue: (t: string) => string | boolean | any
    getTagString: (t: string) => string
    getOneTagForType: (t: string) => PatternTag
    hasValueForType: (t: string) => boolean
    payloadUnavailable?: boolean
    getPayload: () => string
    hasPayload: () => boolean
    setPayload: (val: string) => Pattern

    addTag: (t: string) => Pattern
    addTags: (t: string[]) => Pattern
    removeType: (t: string) => Pattern
    removeTypes: (t: string[]) => Pattern
    dropTagIndex: (n: number) => Pattern
    setTagValueAtIndex: (index: number, value: any) => Pattern;
    findTagIndexOfType: (tagType: string) => number;
    updateTagAtIndex: (index: number, update: (t: PatternTag) => void) => Pattern

    matches: (p: Pattern) => boolean
    isSupersetOf: (p: Pattern) => boolean

    stringify: () => string
    stringifyRelation: () => string
}

export function commandToRelationPattern(str: string) {
    const parsed = parseCommand(str);
    return new PatternValue(parsed.tags)
}

export function commandTagsToRelation(tags: PatternTag[], payload: string): Pattern {
    const pattern = new PatternValue(tags)
    pattern.setPayload(payload);
    return pattern;
}

export function parsePattern(query: string) {
    const parsed = parseCommand('get ' + query);
    return new PatternValue(parsed.tags)
}

