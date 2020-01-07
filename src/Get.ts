
import Command, { CommandTag } from './Command'
import Graph from './Graph'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandTagToString, commandArgsToString } from './parseCommand'
import RelationPattern from './RelationPattern'

export default class Get {
    graph: Graph;
    command: Command;
    pattern: RelationPattern

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;
        this.pattern = new RelationPattern(graph, command)
    }

    hasListResult() {
        return this.pattern.hasStarTag || (this.pattern.starValueTags.length > 0);
    }

    *matchingFullSearch() {
        const graph = this.graph;
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];

            if (this.pattern.matches(rel))
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

        if (this.pattern.hasInheritTags) {
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

    formattedListResult() {
        const variedType = this.pattern.starValueTags[0];

        // Return results. Use shorthand, don't mention tags that were provided exactly.
        const formattedResults = [];
        
        for (const rel of this.matchingFullSearch()) {
            formattedResults.push(this.pattern.formatRelation(rel))
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
