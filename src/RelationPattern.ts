
import Command, { CommandTag } from './Command'
import Relation from './Relation'
import Graph from './Graph'
import { commandTagToString } from './parseCommand'

export default class RelationPattern {

    hasStarTag: boolean
    starValueTags: CommandTag[] = []
    fixedArgs: CommandTag[] = []
    fixedArgsIncludesType: { [typename:string]: true } = {}
    hasInheritTags: boolean = false
    tagCount: number

    constructor(graph: Graph, command: Command) {
        this.tagCount = command.tags.length;

        for (const tag of command.tags) {

            const tagType = graph.findTagType(tag.tagType);

            if (tag.star) {
                this.hasStarTag = true
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
    }

    matches(rel: Relation) {

        // For no star tag: Query must have equal number or more tags than the relation.
        if (!this.hasStarTag && (rel.tagCount > this.tagCount)) {
            return false;
        }

        // With star tag: Query must have fewer tags than the relation
        if (this.hasStarTag && rel.tagCount < this.tagCount)
            return false;

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

    formatRelation(rel: Relation) {
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
