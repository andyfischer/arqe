
import Command, { CommandTag } from './Command'
import Relation from './Relation'
import Graph from './Graph'
import Schema from './Schema'
import parseCommand from './parseCommand'
import { normalizeExactTag, commandTagToString, commandTagsToString } from './stringifyQuery'


export interface FixedTag {
    tagType: string
    tagValue: string
}

export default class RelationPattern {
    tags: CommandTag[] = []
    starValueTags: CommandTag[] = []
    fixedTags: FixedTag[] = []
    fixedTagsForType: { [typename:string]: true } = {}
    tagsForType: { [typename: string]: CommandTag[] } = {}
    tagCount: number
    hasDoubleStar?: boolean
    ntag?: string

    constructor(tags: CommandTag[]) {
        this.tags = tags;
        this.tagCount = tags.length;

        for (const tag of tags) {
            const { tagType } = tag;

            if (!this.tagsForType[tagType])
                this.tagsForType[tagType] = [];

            this.tagsForType[tagType].push(tag);

            if (tag.star) {
                // this.hasStarTag = true
            } else if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedTags.push(tag as FixedTag);
                this.fixedTagsForType[tag.tagType] = true;
            }
        }

        if (!this.isMultiMatch())
            this.ntag = normalizeExactTag(tags);
    }

    isSupersetOf(subPattern: RelationPattern) {
        if (this.hasDoubleStar)
            return true;

        if (this.tagCount !== subPattern.tagCount)
            return false;

        for (const tag of this.tags) {

            let foundMatch = false;

            for (const subTag of subPattern.tagsForType[tag.tagType]) {

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

        if (this.hasDoubleStar)
            return true;

        // Query must have equal number (or greater, for inherit) of tags as the relation.
        if (rel.tagCount() > this.tagCount) {
            return false;
        }

        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedTags) {

            if (!rel.includesType(arg.tagType))
                return false;
            
            if (!arg.tagValue) {
                if (!rel.includesType(arg.tagType))
                    return false;

                continue;
            }

            if (rel.getTagValue(arg.tagType) !== arg.tagValue)
                return false;
        }

        // For all star values: Check that the relation has a tag of this type.
        for (const arg of this.starValueTags) {
            if (!rel.includesType(arg.tagType))
                return false;
        }

        return true;
    }

    isMultiMatch() {
        return this.hasDoubleStar || (this.starValueTags.length > 0);
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

    getOneTagForType(typeName: string) {
        const tags = this.tagsForType[typeName];
        if (!tags)
            return null;

        if (tags.length > 1)
            throw new Error("getOneTagForType - multiple tags found for: " + typeName);

        return tags[0];
    }

    stringify() {
        return commandTagsToString(this.tags);
    }
}

export function commandToRelationPattern(str: string) {
    const parsed = parseCommand(str);
    return new RelationPattern(parsed.tags)
}

