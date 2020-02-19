
import Command from './Command'
import Relation from './Relation'
import Graph from './Graph'
import Schema from './Schema'
import parseCommand, { parseTag } from './parseCommand'
import { normalizeExactTag, commandTagToString, commandTagsToString } from './stringifyQuery'

export interface PatternTag {
    tagType?: string
    tagValue?: string
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    unboundType?: string
    unboundValue?: string
}

export interface FixedTag {
    tagType: string
    tagValue: string
}

export default class RelationPattern {
    tags: PatternTag[] = []
    starValueTags: PatternTag[] = []
    fixedTags: FixedTag[] = []
    fixedTagsForType: { [typename: string]: true } = {}
    tagsForType: { [typename: string]: PatternTag[] } = {}
    hasStar?: boolean
    hasDoubleStar?: boolean
    ntag?: string

    constructor(tags: PatternTag[]) {
        this.tags = tags;

        for (const tag of tags) {
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
        }
    }

    getNtag() {
        if (this.ntag == null)
            this.ntag = normalizeExactTag(this.tags);

        return this.ntag;
    }

    tagCount() {
        return this.tags.length;
    }

    isSupersetOf(subPattern: RelationPattern) {
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

    matches(rel: Relation) {

        const matchPattern = rel.pattern;

        // Check tag count on this relatino.
        if (this.hasDoubleStar) {
            if (matchPattern.tagCount() < this.tagCount())
                return false;
        } else {
            if (matchPattern.tagCount() !== this.tagCount())
                return false;
        }

        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedTags) {

            if (!matchPattern.hasType(arg.tagType))
                return false;
            
            if (!arg.tagValue) {
                if (!matchPattern.hasType(arg.tagType))
                    return false;

                if (matchPattern.hasValueForType(arg.tagType))
                    return false;

                continue;
            }

            if (matchPattern.getTagValue(arg.tagType) !== arg.tagValue)
                return false;
        }

        // For all star values: Check that the relation has a tag of this type.
        for (const arg of this.starValueTags) {
            if (!matchPattern.hasType(arg.tagType))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.hasStar || this.hasDoubleStar || (this.starValueTags.length > 0);
    }

    formatRelationRelative(rel: Relation) {
        const outTags = [];

        for (const tag of rel.eachTag()) {
            if (this.fixedTagsForType[tag.tagType])
                continue;

            outTags.push(commandTagToString(tag));
        }

        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.payload()}` : '');
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

    getOneTagForType(typeName: string) {
        const tags = this.tagsForType[typeName];
        if (!tags)
            return null;

        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);

        return tags[0];
    }

    getTagString(typeName: string) {
        const tag = this.getOneTagForType(typeName);

        if (!tag.tagValue)
            return typeName;

        return typeName + '/' + tag.tagValue;
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

        const newTags = this.tags.slice(0,index).concat(this.tags.slice(index + 1));
        return new RelationPattern(newTags);
    }

    removeType(typeName: string) {
        return new RelationPattern(this.tags.filter(tag => tag.tagType !== typeName));
    }

    addTag(s: string) {
        const tag = parseTag(s);
        return new RelationPattern(this.tags.concat([tag]));
    }

    toRelation() {
        return new Relation(null, this.fixedTags, null);
    }

    stringify() {
        return commandTagsToString(this.tags);
    }
}

export function commandToRelationPattern(str: string) {
    const parsed = parseCommand(str);
    return new RelationPattern(parsed.tags)
}

export function parsePattern(query: string) {
    const parsed = parseCommand('get ' + query);
    return new RelationPattern(parsed.tags)
}

