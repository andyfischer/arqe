"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    listCodeGenerationTargets() {
        const command = `get code-generation/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("code-generation"));
    }
    codeGenerationTargetStrategy(target) {
        const command = `get ${target} strategy/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(codeGenerationTargetStrategy) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(codeGenerationTargetStrategy) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("strategy");
    }
}
exports.default = API;
//# sourceMappingURL=CodeGenerationApi.js.map