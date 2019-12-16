
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
    inheritArgs: CommandTag[] = []
    hasStarTag: boolean
    tagCount: number

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.tagCount = command.tags.length;

        for (const tag of command.tags) {

            const tagType = this.graph.findTagType(tag.tagType);

            if (tag.star) {
                this.hasStarTag = true
            } else if (tag.starValue) {
                this.starValueTags.push(tag);
            } else {
                this.fixedArgs.push(tag);
                this.fixedArgsIncludesType[tag.tagType] = true;
            }

            if (tagType.inherits) {
                tag.tagTypeInherits = true;
                this.inheritArgs.push(tag);
            }
        }
    }

    relationMatches(rel: Relation) {

        // Tag counts must match (unless the query has a * in it)
        if ((rel.tagCount !== this.tagCount) && !this.hasStarTag)
            return false;

        // For all fixed args: Check that each one is found in this relation.
        for (const arg of this.fixedArgs) {
            if (!arg.tagValue) {
                if (!rel.asMap[arg.tagType])
                    return false;

                continue;
            }

            if (arg.tagTypeInherits && rel.includesType(arg.tagType))
                continue;

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
        const found = [];
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

    findOneMatch(): Relation { 
        const found = this.findExactMatch(this.command.tags);
        if (found)
            return found;

        for (const inheritArg of this.inheritArgs) {
            const remainingArgs = this.command.tags.filter(arg => arg.tagType !== inheritArg.tagType);
            const found = this.findExactMatch(remainingArgs);
            if (found)
                return found;
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

    formattedListResult() {
        const variedType = this.starValueTags[0];

        // Return results. Use shorthand, don't mention tags that were provided exactly.
        const outStrings = [];
        
        for (const rel of this.matchingFullSearch()) {

            const outTags = [];

            for (const tag of rel.eachTag()) {
                if (this.fixedArgsIncludesType[tag.tagType])
                    continue;

                outTags.push(commandTagToString(tag));
            }

            outStrings.push(outTags.join(' '))
        }

        return '[' + outStrings.join(', ') + ']'
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
