"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./fs");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    async getBranches(dir) {
        const command = `get git dir(${dir}) branch/*`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("branch"));
    }
    async deleteBranch(dir, branch) {
        const command = `set git dir(${dir}) branch(${branch}) deleted/(set)`;
        const { receiver, promise } = fs_1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=GitBranchesApi.js.map