import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    listTargets(): string[] {
        const command = `get code-generation/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("code-generation"));
    }

    listTouchpoints(target: string): string[] {
        const command = `get ${target} touchpoint/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("touchpoint"));
    }

    getIkImport(target: string): string {
        const command = `get ${target} ik-import/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("ik-import");
    }

    enableVerboseLogging(target: string): boolean {
        const command = `get ${target} verbose-logging`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointFunctionName(touchpoint: string): string {
        const command = `get ${touchpoint} function-name/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("function-name");
    }

    touchpointStyle(touchpoint: string): string {
        const command = `get ${touchpoint} style/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("style");
    }

    touchpointExpectOne(touchpoint: string): boolean {
        const command = `get ${touchpoint} expectOne`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointIsAsync(touchpoint: string): boolean {
        const command = `get ${touchpoint} async`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointIsListener(touchpoint: string): boolean {
        const command = `get ${touchpoint} listener`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsOptional(touchpoint: string): boolean {
        const command = `get ${touchpoint} output optional`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsValue(touchpoint: string): boolean {
        const command = `get ${touchpoint} output value`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputIsExists(touchpoint: string): boolean {
        const command = `get ${touchpoint} output exists`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    touchpointOutput(touchpoint: string): string {
        const command = `get ${touchpoint} output from var`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("from");
    }

    touchpointOutputs(touchpoint: string): string[] {
        const command = `get ${touchpoint} output from var`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("from"));
    }

    touchpointOutputs2(touchpoint: string) {
        const command = `get ${touchpoint} output from var`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    fromStr: rel.getTagValue("from"),
    varStr: rel.getTagValue("var"),
}));
    }

    touchpointInputs(touchpoint: string): string[] {
        const command = `get ${touchpoint} input/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("input"));
    }

    touchpointInputs2(touchpoint: string) {
        const command = `get ${touchpoint} input var type`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    varStr: rel.getTagValue("var"),
    typeStr: rel.getTagValue("type"),
}));
    }

    inputTagType(input: string): string {
        const command = `get ${input} tagType/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("tagType");
    }

    inputName(input: string): string {
        const command = `get ${input} name/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("name");
    }

    inputSortOrder(input: string): string {
        const command = `get ${input} sortOrder/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("sortOrder");
    }

    inputType(input: string): string {
        const command = `get ${input} type/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("type");
    }

    touchpointQueryString(touchpoint: string): string {
        const command = `get ${touchpoint} query/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("query");
    }

    getDestinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("destination-filename");
    }

    getOutputObjectdef(touchpoint: string): string {
        const command = `get ${touchpoint} output objectdef/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("objectdef");
    }

    getObjectdefFields(objectdef: string): string[] {
        const command = `get ${objectdef} objectfield/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("objectdef"));
    }

    touchpointOutputObject(touchpoint: string): string {
        const command = `get ${touchpoint} output output-object/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("output-object");
    }

    outputObjectFields(outputObject: string) {
        const command = `get ${outputObject} field/* tagValue/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }

    outputObjectTagFields(outputObject: string) {
        const command = `get ${outputObject} field/* tag/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tag: rel.getTagValue("tag"),
        }));
    }

    outputObjectTagValueFields(outputObject: string) {
        const command = `get ${outputObject} field/* tagValue/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }

    touchpointEventTypes(touchpoint: string): string[] {
        const command = `get ${touchpoint} eventType/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("eventType"));
    }

    eventTypeQuery(eventType: string): string[] {
        const command = `get ${eventType} query/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("query"));
    }

    eventTypeIsDeletion(eventType: string): boolean {
        const command = `get ${eventType} deletion`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    eventTypeId(eventType: string): string[] {
        const command = `get ${eventType} id/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("id"));
    }

    eventTypeProvides(eventType: string) {
        const command = `get ${eventType} provide var/* from/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    fromStr: rel.getTagValue("from"),
    varStr: rel.getTagValue("var"),
}));
    }
}