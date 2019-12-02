
import Command, { CommandTag } from './Command'
import Graph from './Graph'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'

export default class Get {

    graph: Graph;
    command: Command;
    fixedArgs: CommandTag[] = []
    starValueTags: CommandTag[] = []
    inheritArgs: CommandTag[] = []

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.command = command;

        for (const tag of command.tags) {

            const tagType = this.graph.findTagType(tag.tagType);

            if (tag.starValue)
                this.starValueTags.push(tag);
            else
                this.fixedArgs.push(tag);

            if (tagType.inherits) {
                tag.tagTypeInherits = true;
                this.inheritArgs.push(tag);
            }
        }
    }

    relationMatches(rel: Relation) {
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

        for (const arg of this.starValueTags) {
            if (!rel.asMap[arg.tagType])
                return false;
        }

        return true;
    }

    fullSearch(): Relation[] {
        const found = [];
        const graph = this.graph;
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];
            if (this.relationMatches(rel))
                found.push(rel);
        }
        return found;
    }

    runFullSearch() {
        const matches = this.fullSearch()
        const variedType = this.starValueTags[0];

        const outValues = [];
        for (const match of matches) {
            outValues.push(match.asMap[variedType.tagType]);
        }

        return '[' + outValues.join(', ') + ']'
    }

    findExactMatch(args: CommandTag[]): Relation|null {
        // Exact tag lookup.
        const ntag = normalizeExactTag(args);

        return this.graph.relationsByNtag[ntag]
    }

    run(): string {
        if (this.starValueTags.length > 0)
            return this.runFullSearch();

        const found = this.findExactMatch(this.command.tags);
        if (found)
            return found.payloadStr;

        for (const inheritArg of this.inheritArgs) {
            const remainingArgs = this.command.tags.filter(arg => arg.tagType !== inheritArg.tagType);
            const found = this.findExactMatch(remainingArgs);
            if (found)
                return found.payloadStr;
        }

        return '#null';
    }
}
