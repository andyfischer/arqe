
import Command, { CommandTag } from './Command'
import Graph from './Graph'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'

export default class Get {

    graph: Graph;
    originalArgs: CommandTag[]
    fixedArgs: CommandTag[] = []
    starValueTags: CommandTag[] = []
    inheritArgs: CommandTag[] = []

    constructor(graph: Graph, args: CommandTag[]) {
        this.graph = graph;
        this.originalArgs = args;

        for (const arg of args) {

            const tagType = this.graph.findTagType(arg.tagType);

            if (arg.starValue)
                this.starValueTags.push(arg);
            else
                this.fixedArgs.push(arg);

            if (tagType.inherits) {
                arg.tagTypeInherits = true;
                this.inheritArgs.push(arg);
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

    checkExactMatch(args: CommandTag[]) {
        // Exact tag lookup.
        const ntag = normalizeExactTag(args);

        if (this.graph.relationsByNtag[ntag])
            return true;

        return false;
    }

    run(): string {
        if (this.starValueTags.length > 0)
            return this.runFullSearch();

        if (this.checkExactMatch(this.originalArgs))
            return '#exists'

        for (const inheritArg of this.inheritArgs) {
            const remainingArgs = this.originalArgs.filter(arg => arg.tagType !== inheritArg.tagType);
            if (this.checkExactMatch(remainingArgs))
                return '#exists'
        }

        return '#null';
    }
}
