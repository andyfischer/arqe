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
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("ik-import");
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
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("function-name");
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
    touchpointTagValueOutputs(touchpoint) {
        const command = `get ${touchpoint} output tagValue/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("tagValue"));
    }
    touchpointTagValueOutput(touchpoint) {
        const command = `get ${touchpoint} output tagValue/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("tagValue");
    }
    touchpointTagOutputs(touchpoint) {
        const command = `get ${touchpoint} output tag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("tag"));
    }
    touchpointTagOutput(touchpoint) {
        const command = `get ${touchpoint} output tag/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("tag");
    }
    touchpointOutputType(touchpoint) {
        const command = `get ${touchpoint} output type/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("type");
    }
    touchpointInputs(touchpoint) {
        const command = `get ${touchpoint} input/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("input"));
    }
    inputTagType(input) {
        const command = `get ${input} tagType/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("tagType");
    }
    inputName(input) {
        const command = `get ${input} name/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("name");
    }
    inputSortOrder(input) {
        const command = `get ${input} sortOrder/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("sortOrder");
    }
    inputType(input) {
        const command = `get ${input} type/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("type");
    }
    touchpointQueryString(touchpoint) {
        const command = `get ${touchpoint} query/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTagValue("query");
    }
    getDestinationFilename(target) {
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
    getOutputObjectdef(touchpoint) {
        const command = `get ${touchpoint} output objectdef/*`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("objectdef");
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
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("output-object");
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
}
exports.default = API;
//# sourceMappingURL=DAOGeneratorGeneratedDAO.js.map