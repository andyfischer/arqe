import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/dao constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listTargets(): string[] {
        const command = `get code-generation/* destination-filename`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("code-generation"));
    }

    getInterfaceFields(target: string) {
        const command = `get ${target} field/* type/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    field: rel.getTagValue("field"),
    typeStr: rel.getTagValue("type"),
}));
    }

    listTouchpoints(target: string): string[] {
        const command = `get ${target} touchpoint/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("touchpoint"));
    }

    getIkImport(target: string): string {
        const command = `get ${target} ik-import/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getIkImport) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getIkImport) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("ik-import");
    }

    enableVerboseLogging(target: string): boolean {
        const command = `get ${target} verbose-logging`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointFunctionName(touchpoint: string): string {
        const command = `get ${touchpoint} function-name/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(touchpointFunctionName) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(touchpointFunctionName) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("function-name");
    }

    touchpointStyle(touchpoint: string): string {
        const command = `get ${touchpoint} style/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointStyle) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("style");
    }

    touchpointExpectOne(touchpoint: string): boolean {
        const command = `get ${touchpoint} expectOne`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointIsAsync(touchpoint: string): boolean {
        const command = `get ${touchpoint} async`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointIsListener(touchpoint: string): boolean {
        const command = `get ${touchpoint} listener`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsOptional(touchpoint: string): boolean {
        const command = `get ${touchpoint} output optional`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsValue(touchpoint: string): boolean {
        const command = `get ${touchpoint} output value`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsExists(touchpoint: string): boolean {
        const command = `get ${touchpoint} output exists`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutput(touchpoint: string): string {
        const command = `get ${touchpoint} output from var`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointOutput) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("from");
    }

    touchpointOutputs(touchpoint: string): string[] {
        const command = `get ${touchpoint} output from var`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("from"));
    }

    touchpointOutputs2(touchpoint: string) {
        const command = `get ${touchpoint} output from var`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    fromStr: rel.getTagValue("from"),
    varStr: rel.getTagValue("var"),
}));
    }

    touchpointInputDataFrom(touchpoint: string, varStr: string): string {
        const command = `get ${touchpoint} input var(${varStr}) dataFrom`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointInputDataFrom) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("dataFrom");
    }

    touchpointInputs(touchpoint: string): string[] {
        const command = `get ${touchpoint} input/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("input"));
    }

    touchpointInputs2(touchpoint: string) {
        const command = `get ${touchpoint} input var type`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    varStr: rel.getTagValue("var"),
    typeStr: rel.getTagValue("type"),
}));
    }

    inputTagType(input: string): string {
        const command = `get ${input} tagType/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(inputTagType) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("tagType");
    }

    inputName(input: string): string {
        const command = `get ${input} name/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(inputName) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(inputName) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("name");
    }

    inputSortOrder(input: string): string {
        const command = `get ${input} sortOrder/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(inputSortOrder) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("sortOrder");
    }

    inputType(input: string): string {
        const command = `get ${input} type/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(inputType) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("type");
    }

    touchpointQueryString(touchpoint: string): string {
        const command = `get ${touchpoint} query/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(touchpointQueryString) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(touchpointQueryString) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("query");
    }

    getDestinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getDestinationFilename) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getDestinationFilename) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("destination-filename");
    }

    getOutputObjectdef(touchpoint: string): string {
        const command = `get ${touchpoint} output objectdef/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getOutputObjectdef) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getOutputObjectdef) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("objectdef");
    }

    getObjectdefFields(objectdef: string): string[] {
        const command = `get ${objectdef} objectfield/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("objectdef"));
    }

    touchpointOutputObject(touchpoint: string): string {
        const command = `get ${touchpoint} output output-object/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointOutputObject) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("output-object");
    }

    outputObjectFields(outputObject: string) {
        const command = `get ${outputObject} field/* tagValue/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }

    outputObjectTagFields(outputObject: string) {
        const command = `get ${outputObject} field/* tag/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tag: rel.getTagValue("tag"),
        }));
    }

    outputObjectTagValueFields(outputObject: string) {
        const command = `get ${outputObject} field/* tagValue/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }

    touchpointEventTypes(touchpoint: string): string[] {
        const command = `get ${touchpoint} eventType/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("eventType"));
    }

    eventTypeQuery(eventType: string): string[] {
        const command = `get ${eventType} query/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("query"));
    }

    eventTypeIsDeletion(eventType: string): boolean {
        const command = `get ${eventType} deletion`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    eventTypeId(eventType: string): string[] {
        const command = `get ${eventType} id/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("id"));
    }

    eventTypeProvides(eventType: string) {
        const command = `get ${eventType} provide var/* from/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    fromStr: rel.getTagValue("from"),
    varStr: rel.getTagValue("var"),
}));
    }
}