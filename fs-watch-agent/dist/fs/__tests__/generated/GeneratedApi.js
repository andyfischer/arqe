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
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("b");
    }
    getOneTagValue() {
        const command = `get a/1 b/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("b");
    }
    getCurrentFlag(target) {
        const command = `get ${target} flag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("flag");
    }
    getUsingCommandChain(target) {
        const command = `get ${target} flag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("flag");
    }
    changeFlag(target, val) {
        const command = `delete ${target} flag/* | set ${target} flag/${val}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=GeneratedApi.js.map