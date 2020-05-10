"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    fromFile(target) {
        const command = `get ${target} from-file`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getPayload();
    }
    destinationFilename(target) {
        const command = `get ${target} destination-filename/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("destination-filename");
    }
}
exports.default = API;
//# sourceMappingURL=TextAsCodeApi.js.map