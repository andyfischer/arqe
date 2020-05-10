"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findTagWithPrefix(parsedTag, prefix) {
    for (const tag of parsedTag.tags)
        if (tag.startsWith(prefix))
            return tag;
    return null;
}
class LiveSearch {
    constructor() {
        this.latestMatches = {};
        this.exactTags = [];
        this.tagPrefixes = [];
    }
    matches(parsedTag) {
        if (parsedTag.tagCount !== this.tagCount)
            return false;
        for (const exact of this.exactTags) {
            if (!parsedTag.tagTable[exact])
                return false;
        }
        for (const prefix of this.tagPrefixes) {
            if (findTagWithPrefix(parsedTag, prefix) === null)
                return false;
        }
        return true;
    }
    toFoundMatch(parsedTag) {
        if (this.tagPrefixes.length === 1) {
            for (const prefix of this.tagPrefixes) {
                const tag = findTagWithPrefix(parsedTag, prefix);
                return {
                    remainingTag: tag.substring(prefix.length)
                };
            }
        }
        else {
            return {
                remainingTag: ''
            };
        }
    }
    maybeInclude(parsedTag) {
        if (this.matches(parsedTag)) {
            this.latestMatches[parsedTag.normalizedString] = this.toFoundMatch(parsedTag);
        }
    }
    maybeDelete(tag) {
        delete this.latestMatches[tag];
    }
    latest(graph) {
        const results = [];
        for (const normalizedTag in this.latestMatches) {
            const value = graph.relations[normalizedTag].value;
            results.push(value);
        }
        return results;
    }
    latestExt(graph) {
        const results = [];
        for (const normalizedTag in this.latestMatches) {
            const matchInfo = this.latestMatches[normalizedTag];
            const value = graph.relations[normalizedTag].value;
            results.push({
                value,
                tag: normalizedTag,
                remainingTag: matchInfo.remainingTag
            });
        }
        return results;
    }
}
exports.default = LiveSearch;
//# sourceMappingURL=LiveSearch.js.map