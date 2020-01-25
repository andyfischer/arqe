
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
    fixedArgsIncludesType: { [typename:string]: true } = {}
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

            const tagType = schema.findTagType(tag.tagType);

            if (tag.star) {
                // this.hasStarTag = true
            } else if (tag.doubleStar) {
                this.hasDoubleStar = true;
            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedArgs.push(tag);
                this.fixedArgsIncludesType[tag.tagType] = true;
            }

            if (tagType.inherits) {
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
        if (rel.tags.length > this.tagCount) {
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
                if (!rel.asMap[arg.tagType])
                    return false;

                continue;
            }

            if (rel.asMap[arg.tagType] !== arg.tagValue)
                return false;
        }

        // For all star values: Check that the relation has a tag of this type.
        for (const arg of this.starValueTags) {
            if (!rel.asMap[arg.tagType])
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
            if (this.fixedArgsIncludesType[tag.tagType])
                continue;

            outTags.push(commandTagToString(tag));
        }

        const str = outTags.join(' ') + (rel.hasPayload() ? ` == ${rel.payloadStr}` : '');
        return str;
    }
}

export function commandToRelationPattern(schema: Schema, str: string) {
    const parsed = parseCommand(str);
    return new RelationPattern(schema, parsed)
}
