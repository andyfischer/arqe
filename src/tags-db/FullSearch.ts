
import Graph from './Graph'
import { CommandTag } from './Command'
import Relation from './Relation'

export default class FullSearch {
    graph: Graph;
    fixedTags: CommandTag[] = []
    starValueTags: CommandTag[] = []

    constructor(graph: Graph, tags: CommandTag[]) {
        this.graph = graph;
        for (const arg of tags)
            if (arg.starValue)
                this.starValueTags.push(arg);
            else
                this.fixedTags.push(arg);
    }

    relationMatches(rel: Relation) {
        for (const arg of this.fixedTags) {
            if (!arg.tagValue) {
                if (!rel.asMap[arg.tagType])
                    return false;

                continue;
            }

            if (rel.asMap[arg.tagType] !== arg.tagValue)
                return false;
        }

        for (const arg of this.starValueTags)
            if (!rel.asMap[arg.tagType])
                return false;

        return true;
    }

    run() {
        const found = [];
        const graph = this.graph;
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];
            if (this.relationMatches(rel))
                found.push(rel);
        }
        return found;
    }

}
