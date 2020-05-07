
import Command from './Command'
import Graph from './Graph'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, patternTagToString, commandTagsToString } from './stringifyQuery'
import PatternTag, { newTag, FixedTag } from './PatternTag'

export default class Pattern {
    
    tags: PatternTag[] = []

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
        if (!Array.isArray(tags))
            throw new Error("expected 'tags' to be an Array");

        this.tags = tags;
        this.updateDerivedData();
        Object.freeze(this.tags);
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
        const pattern = new Pattern(tags);
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

    getNtag() {
        if (this.ntag == null)
            this.ntag = normalizeExactTag(this.tags);

        return this.ntag;
    }

    tagCount() {
        return this.tags.length;
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

                if (!tag.tagValue || (tag.tagValue === subTag.tagValue))
                    foundMatch = true;
            }

            if (!foundMatch)
                return false;
        }

        return true;
    }

    matches(rel: Pattern) {

        // Check tag count on this relation.
        if (this.hasDoubleStar) {
            const tagCountWithoutDoubleStar = this.tagCount() - 1;
            if (rel.tagCount() < tagCountWithoutDoubleStar)
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

                //if (rel.hasValueForType(arg.tagType))
                //    return false;

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

            outTags.push(patternTagToString(tag));
        }

        const str = outTags.join(' ');
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

    findTagWithType(tagType: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].tagType === tagType)
                return this.tags[i];
        return null;
    }

    findTagIndexOfType(tagType: string) {
        for (let i = 0; i < this.tags.length; i++)
            if (this.tags[i].tagType === tagType)
                return i;
        return -1;
    }

    updateTagOfType(tagType: string, update: (t: PatternTag) => PatternTag) {
        const index = this.findTagIndexOfType(tagType);
        if (index === -1)
            throw new Error('tag type not found: ' + tagType);
        return this.updateTagAtIndex(index, update);
    }

    updateTagAtIndex(index: number, update: (t: PatternTag) => PatternTag) {
        const tags = this.tags.map(t => t);
        tags[index] = update(tags[index]);
        return this.copyWithNewTags(tags);
    }

    removeType(typeName: string) {
        return this.copyWithNewTags(this.tags.filter(tag => tag.tagType !== typeName));
    }

    removeTypes(typeNames: string[]) {
        return this.copyWithNewTags(this.tags.filter(tag => typeNames.indexOf(tag.tagType) === -1));
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
}

export function commandToRelationPattern(str: string) {
    const parsed = parseCommand(str);
    return parsed.pattern;
}

export function patternFromMap(map: Map<string,string>) {
    const tags = []
    for (const [key,value] of map.entries()) {
        const tag = new PatternTag();
        tag.tagType = key;
        tag.tagValue = value;
        tags.push(tag);
    }

    return new Pattern(tags);
}

export function commandTagsToRelation(tags: PatternTag[], payload?: string): Pattern {
    const pattern = new Pattern(tags)
    return pattern;
}

export function parsePattern(query: string) {
    const parsed = parseCommand('get ' + query);
    return parsed.pattern;
}

