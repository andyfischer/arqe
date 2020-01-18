
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

    constructor(schema: Schema, command: Command) {
        this.schema = schema;
        this.command = command;
        this.tagCount = command.tags.length;

        for (const tag of command.tags) {

            const tagType = schema.findTagType(tag.tagType);

            if (tag.star) {
                // this.hasStarTag = true
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

        // Query must have equal number (or greater, for inherit) of tags as the relation.
        if (rel.tagCount > this.tagCount) {
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
        return (this.starValueTags.length > 0);
    }

    *linearScan(graph: Graph) {
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];

            if (this.matches(rel))
                yield rel;
        }
    }

    findExactMatch(graph: Graph, args: CommandTag[]): Relation|null {
        // Exact tag lookup.
        const ntag = normalizeExactTag(args);
        return graph.relationsByNtag[ntag]
    }

    findOneMatch(graph: Graph): Relation { 
        const found = this.findExactMatch(graph, this.command.tags);
        if (found)
            return found;

        if (this.hasInheritTags) {
            for (const match of this.linearScan(graph)) {
                return match;
            }
        }
    }

    *allMatches(graph: Graph) {
        if (this.isMultiMatch()) {
            yield *this.linearScan(graph);
        } else {
            const one = this.findOneMatch(graph);
            if (one)
                yield one;
        }
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

export function commandToRelationPattern(schema: Schema, str: string) {
    const parsed = parseCommand(str);
    return new RelationPattern(schema, parsed)
}
