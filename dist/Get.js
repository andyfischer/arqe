"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("./parseCommand");
const RelationPattern_1 = __importDefault(require("./RelationPattern"));
class Get {
    constructor(graph, command) {
        this.graph = graph;
        this.command = command;
        this.pattern = new RelationPattern_1.default(graph, command);
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
    findExactMatch(args) {
        const ntag = parseCommand_1.normalizeExactTag(args);
        return this.graph.relationsByNtag[ntag];
    }
    findOneMatch() {
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
            yield* this.matchingFullSearch();
        }
        else {
            const one = this.findOneMatch();
            if (one)
                yield one;
        }
    }
    formattedListResult() {
        const variedType = this.pattern.starValueTags[0];
        const formattedResults = [];
        for (const rel of this.matchingFullSearch()) {
            formattedResults.push(this.pattern.formatRelation(rel));
        }
        return '[' + formattedResults.join(', ') + ']';
    }
    extendedResult() {
        return this.command.flags.x;
    }
    formattedSingleResult() {
        const found = this.findOneMatch();
        if (!found)
            return '#null';
        if (this.extendedResult()) {
            return this.graph.stringifyRelation(found);
        }
        else {
            return found.payloadStr;
        }
    }
    formattedResult() {
        if (this.hasListResult())
            return this.formattedListResult();
        else
            return this.formattedSingleResult();
    }
}
exports.default = Get;
//# sourceMappingURL=Get.js.map