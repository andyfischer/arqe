"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GitHooks {
    constructor(graph) {
        this.graph = graph;
    }
    hookPattern(pattern) {
        return pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir');
    }
    saveNewRelation(relation, output) {
    }
    *iterateSlots(pattern) {
    }
}
function setupGitHooks(graph) {
    return new GitHooks(graph);
}
exports.default = setupGitHooks;
//# sourceMappingURL=Git.js.map