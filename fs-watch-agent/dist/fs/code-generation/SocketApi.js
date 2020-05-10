"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    createUniqueConnection() {
        const command = `set connection/unique`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("connection");
    }
    deleteConnection(connection) {
        const command = `delete ${connection}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=SocketApi.js.map