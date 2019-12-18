
import Command, { CommandTag } from './Command'
import Graph from './Graph'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandTagToString, commandArgsToString } from './parseCommand'

export default class Get {

    graph: Graph;
    command: Command;
    fixedArgs: CommandTag[] = []
    fixedArgsIncludesType: { [typename:string]: true } = {}
    starValueTags: CommandTag[] = []
    tagTypes: TagType[] = []
    hasInheritTags: boolean = false
    hasStarTag: boolean
    tagCount: number

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.tagCount = command.tags.length;

        for (const tag of command.tags) {

            const tagType = this.graph.findTagType(tag.tagType);
            this.tagTypes.push(tagType)

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

    relationMatches(rel: Relation) {

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

    hasListResult() {
        return this.hasStarTag || (this.starValueTags.length > 0);
    }

    *matchingFullSearch() {
        const graph = this.graph;
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];

            if (this.relationMatches(rel))
                yield rel;
        }
    }

    findExactMatch(args: CommandTag[]): Relation|null {
        // Exact tag lookup.
        const ntag = normalizeExactTag(args);

        return this.graph.relationsByNtag[ntag]
    }

    /*
    *variantsForInheritTags(startIndex: number) {
        for (let index=startIndex; index < this.tagTypes.length; index += 1) {
            const tagType = this.tagTypes[index];
            if (tagType.inherits) {
                console.log('found inherits tag: ', tagType.inherits);
                const remainingArgs = this.command.tags.filter(arg => arg.tagType !== tagType.name);
                yield remainingArgs;
                yield *this.variantsForInheritTags(startIndex + 1);
            }
        }
    }
    */

    findOneMatch(): Relation { 
        const found = this.findExactMatch(this.command.tags);
        if (found)
            return found;

        if (this.hasInheritTags) {
            for (const match of this.matchingFullSearch()) {
                return match;
            }
        }
    }

    *matchingRelations() {
        if (this.hasListResult()) {
            yield *this.matchingFullSearch();
        } else {
            const one = this.findOneMatch();
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

    formattedListResult() {
        const variedType = this.starValueTags[0];

        // Return results. Use shorthand, don't mention tags that were provided exactly.
        const formattedResults = [];
        
        for (const rel of this.matchingFullSearch()) {
            formattedResults.push(this.formatRelation(rel))
        }

        return '[' + formattedResults.join(', ') + ']'
    }

    extendedResult() {
        return this.command.flags.x;
    }

    formattedSingleResult() {
        const found = this.findOneMatch();

        if (!found)
            return '#null'

        if (this.extendedResult()) {
            return this.graph.stringifyRelation(found);
        } else {
            return found.payloadStr;
        }
    }

    formattedResult(): string {
        if (this.hasListResult())
            return this.formattedListResult();
        else
            return this.formattedSingleResult();
    }
}
