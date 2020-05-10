"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LiveSearch_1 = __importDefault(require("./LiveSearch"));
const parseTag_1 = __importDefault(require("./parseTag"));
function createSearch(graph, pattern) {
    const items = pattern.split(' ');
    const search = new LiveSearch_1.default();
    search.tagCount = items.length;
    for (const item of items) {
        if (item === '*')
            continue;
        if (item.endsWith('*')) {
            search.tagPrefixes.push(item.replace(/\*$/, ''));
            continue;
        }
        search.exactTags.push(item);
    }
    for (const existingRelationTag in graph.relations) {
        const parsed = parseTag_1.default(existingRelationTag);
        search.maybeInclude(parsed);
    }
    return search;
}
exports.default = createSearch;
//# sourceMappingURL=createSearch.js.map