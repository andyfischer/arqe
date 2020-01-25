
import Command, { CommandTag } from './Command'
import Relation from './Relation'
import Graph from './Graph'
import Schema from './Schema'
import parseCommand, { normalizeExactTag, commandTagToString } from './parseCommand'

export default class RelationPattern {

    schema: Schema
    command: Command;
    starValueTags: CommandTag[] = []
    fixedArgs: CommandTag[] = []
    fixedArgForType: { [typename:string]: true } = {}
    tagsForType: { [typename: string]: CommandTag[] } = {}
    hasInheritTags: boolean = false
    tagCount: number
    error?: string
    hasDoubleStar?: boolean
    ntag?: string

    constructor(schema: Schema, command: Command) {
        this.schema = schema;
        this.command = command;
        this.tagCount = command.tags.length;

        for (const tag of command.tags) {
            const { tagType } = tag;

            if (!this.tagsForType[tagType])
                this.tagsForType[tagType] = [];

            this.tagsForType[tagType].push(tag);

            const tagInfo = schema.findTagType(tag.tagType);

            if (tag.star) {
                // this.hasStarTag = true
            } else if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedArgs.push(tag);
                this.fixedArgForType[tag.tagType] = true;
            }

            if (tagInfo.inherits) {
                this.hasInheritTags = true
                tag.tagTypeInherits = true;
            }
        }

        if (!this.isMultiMatch())
            this.ntag = normalizeExactTag(command.tags);
    }

    matches(rel: Relation) {

        if (this.hasDoubleStar)
            return true;

        // Query must have equal number (or greater, for inherit) of tags as the relation.
        if (rel.tagCount() > this.tagCount) {
            return false;
        }

        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedArgs) {

            if (!rel.includesType(arg.tagType)) {
                // The relation doesn't mention this type. If this is an 'inherits' type
                // then that's fine, otherwise disqualify.
                if (arg.tagTypeInherits) {
                    continue;
                } else {
                    return false;
                }
            }
                
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
            if (this.fixedArgForType[tag.tagType])
                continue;

            outTags.push(commandTagToString(tag));
        }

        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.payloadStr}` : '');
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
}

export function commandToRelationPattern(schema: Schema, str: string) {
    const parsed = parseCommand(str);
    return new RelationPattern(schema, parsed)
}
