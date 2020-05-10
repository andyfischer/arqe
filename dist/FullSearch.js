"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FullSearch {
    constructor(graph, tags) {
        this.fixedTags = [];
        this.starValueTags = [];
        this.graph = graph;
        for (const arg of tags)
            if (arg.starValue)
                this.starValueTags.push(arg);
            else
                this.fixedTags.push(arg);
    }
    relationMatches(rel) {
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
exports.default = FullSearch;
//# sourceMappingURL=FullSearch.js.map