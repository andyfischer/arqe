"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    listTargets() {
        const command = `get code-generation/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("code-generation"));
    }
    getInterfaceFields(target) {
        const command = `get ${target} field/* type/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            typeStr: rel.getTagValue("type"),
        }));
    }
    listTouchpoints(target) {
        const command = `get ${target} touchpoint/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("touchpoint"));
    }
    getIkImport(target) {
        const command = `get ${target} ik-import/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getIkImport) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getIkImport) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("ik-import");
    }
    enableVerboseLogging(target) {
        const command = `get ${target} verbose-logging`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointFunctionName(touchpoint) {
        const command = `get ${touchpoint} function-name/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(touchpointFunctionName) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(touchpointFunctionName) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("function-name");
    }
    touchpointStyle(touchpoint) {
        const command = `get ${touchpoint} style/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(touchpointStyle) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("style");
    }
    touchpointExpectOne(touchpoint) {
        const command = `get ${touchpoint} expectOne`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointIsAsync(touchpoint) {
        const command = `get ${touchpoint} async`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointIsListener(touchpoint) {
        const command = `get ${touchpoint} listener`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointOutputIsOptional(touchpoint) {
        const command = `get ${touchpoint} output optional`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointOutputIsValue(touchpoint) {
        const command = `get ${touchpoint} output value`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointOutputIsExists(touchpoint) {
        const command = `get ${touchpoint} output exists`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    touchpointOutput(touchpoint) {
        const command = `get ${touchpoint} output from var`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(touchpointOutput) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("from");
    }
    touchpointOutputs(touchpoint) {
        const command = `get ${touchpoint} output from var`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("from"));
    }
    touchpointOutputs2(touchpoint) {
        const command = `get ${touchpoint} output from var`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            fromStr: rel.getTagValue("from"),
            varStr: rel.getTagValue("var"),
        }));
    }
    touchpointInputDataFrom(touchpoint, varStr) {
        const command = `get ${touchpoint} input var(${varStr}) dataFrom`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(touchpointInputDataFrom) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("dataFrom");
    }
    touchpointInputs(touchpoint) {
        const command = `get ${touchpoint} input/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("input"));
    }
    touchpointInputs2(touchpoint) {
        const command = `get ${touchpoint} input var type`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            varStr: rel.getTagValue("var"),
            typeStr: rel.getTagValue("type"),
        }));
    }
    inputTagType(input) {
        const command = `get ${input} tagType/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(inputTagType) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("tagType");
    }
    inputName(input) {
        const command = `get ${input} name/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(inputName) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(inputName) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("name");
    }
    inputSortOrder(input) {
        const command = `get ${input} sortOrder/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(inputSortOrder) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("sortOrder");
    }
    inputType(input) {
        const command = `get ${input} type/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(inputType) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("type");
    }
    touchpointQueryString(touchpoint) {
        const command = `get ${touchpoint} query/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(touchpointQueryString) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(touchpointQueryString) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("query");
    }
    getDestinationFilename(target) {
        const command = `get ${target} destination-filename/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getDestinationFilename) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getDestinationFilename) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTagValue("destination-filename");
    }
    getOutputObjectdef(touchpoint) {
        const command = `get ${touchpoint} output objectdef/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(getOutputObjectdef) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(getOutputObjectdef) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("objectdef");
    }
    getObjectdefFields(objectdef) {
        const command = `get ${objectdef} objectfield/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("objectdef"));
    }
    touchpointOutputObject(touchpoint) {
        const command = `get ${touchpoint} output output-object/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(touchpointOutputObject) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("output-object");
    }
    outputObjectFields(outputObject) {
        const command = `get ${outputObject} field/* tagValue/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }
    outputObjectTagFields(outputObject) {
        const command = `get ${outputObject} field/* tag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tag: rel.getTagValue("tag"),
        }));
    }
    outputObjectTagValueFields(outputObject) {
        const command = `get ${outputObject} field/* tagValue/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }
    touchpointEventTypes(touchpoint) {
        const command = `get ${touchpoint} eventType/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("eventType"));
    }
    eventTypeQuery(eventType) {
        const command = `get ${eventType} query/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("query"));
    }
    eventTypeIsDeletion(eventType) {
        const command = `get ${eventType} deletion`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    eventTypeId(eventType) {
        const command = `get ${eventType} id/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("id"));
    }
    eventTypeProvides(eventType) {
        const command = `get ${eventType} provide var/* from/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => ({
            fromStr: rel.getTagValue("from"),
            varStr: rel.getTagValue("var"),
        }));
    }
}
exports.default = API;
//# sourceMappingURL=DAOGeneratorGeneratedDAO.js.map