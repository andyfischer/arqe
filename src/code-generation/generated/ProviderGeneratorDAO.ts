import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike
    target: string

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/providerGenerator constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    getDestinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getDestinationFilename) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getDestinationFilename) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("destination-filename");
    }

    getIkImport(target: string): string {
        const command = `get ${target} ik-import/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getIkImport) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getIkImport) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("ik-import");
    }

    touchpointFunctionName(touchpoint: string): string {
        const command = `get ${touchpoint} function-name/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(touchpointFunctionName) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(touchpointFunctionName) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("function-name");
    }

    touchpointInputs2(touchpoint: string) {
        const command = `get ${touchpoint} input var type`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => ({
    varStr: rel.getVal("var"),
    typeStr: rel.getVal("type"),
}));
    }

    touchpointOutputs2(touchpoint: string) {
        const command = `get ${touchpoint} output from var`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => ({
    fromStr: rel.getVal("from"),
    varStr: rel.getVal("var"),
}));
    }

    touchpointIsAsync(touchpoint: string): boolean {
        const command = `get ${touchpoint} async`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.length > 0;
    }

    touchpointOutputExpectOne(touchpoint: string): boolean {
        const command = `get ${touchpoint} output expectOne`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.length > 0;
    }

    getHandlesPattern(target: string): string {
        const command = `get ${target} handles-pattern/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getHandlesPattern) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getHandlesPattern) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("handles-pattern");
    }

    touchpointOutputWithType(touchpoint: string): string {
        const command = `get ${touchpoint} output var type`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointOutputWithType) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("type");
    }

    listHandlers(): string[] {
        const target = this.target;
        const command = `get ${target} handler/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => rel.getTag("handler"));
    }

    handlerQuery(handler: string): string {
        const command = `get ${handler} handles-query/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(handlerQuery) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(handlerQuery) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("handles-query");
    }
}