"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    async getCliInput(name) {
        const execId = this.execId;
        const command = `get ${execId} cli-input(${name}) value/*`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getCliInput) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getCliInput) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("value");
    }
}
exports.default = API;
//# sourceMappingURL=CommandLineToolApi.js.map