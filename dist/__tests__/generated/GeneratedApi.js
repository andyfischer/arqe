"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    getOneTag() {
        const command = `get a/1 b/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getOneTag) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getOneTag) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("b");
    }
    getOneTagValue() {
        const command = `get a/1 b/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getOneTagValue) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getOneTagValue) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("b");
    }
    getCurrentFlag(target) {
        const command = `get ${target} flag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getCurrentFlag) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getCurrentFlag) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("flag");
    }
    getUsingCommandChain(target) {
        const command = `get ${target} flag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getUsingCommandChain) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getUsingCommandChain) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("flag");
    }
    changeFlag(target, val) {
        const command = `delete ${target} flag/* | set ${target} flag/${val}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=GeneratedApi.js.map