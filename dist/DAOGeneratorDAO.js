"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    run(command) {
        this.graph.run(command);
    }
    enableVerboseLogging() {
        const queryStr = `code-generation verbose-logging`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    listTouchpoints() {
        const queryStr = `touchpoint/*`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("touchpoint"));
    }
    touchpointFunctionName(touchpoint) {
        const queryStr = `${touchpoint} .functionName`;
        const rels = this.graph.getRelationsSync(queryStr);
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr);
        }
        const rel = rels[0];
        return rel.getValue();
    }
    touchpointExpectOne(touchpoint) {
        const queryStr = `${touchpoint} expectOne`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    touchpointOutputIsOptional(touchpoint) {
        const queryStr = `${touchpoint} output optional`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    touchpointOutputIsValue(touchpoint) {
        const queryStr = `${touchpoint} output value`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    touchpointOutputIsExists(touchpoint) {
        const queryStr = `${touchpoint} output exists`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    touchpointTagValueOutputs(touchpoint) {
        const queryStr = `${touchpoint} output tagValue/*`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tagValue"));
    }
    touchpointTagValueOutput(touchpoint) {
        const queryStr = `${touchpoint} output tagValue/*`;
        const rels = this.graph.getRelationsSync(queryStr);
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr);
        }
        const rel = rels[0];
        return rel.getTagValue("tagValue");
    }
    touchpointTagOutputs(touchpoint) {
        const queryStr = `${touchpoint} output tag/*`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
    touchpointTagOutput(touchpoint) {
        const queryStr = `${touchpoint} output tag/*`;
        const rels = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
}
exports.default = API;
//# sourceMappingURL=DAOGeneratorDAO.js.map