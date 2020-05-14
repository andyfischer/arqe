import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike
    target: string

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    getDestinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Relation[] = this.graph.runSync(command)
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

    getIkImport(target: string): string {
        const command = `get ${target} ik-import/*`;

        const rels: Relation[] = this.graph.runSync(command)
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

    touchpointFunctionName(touchpoint: string): string {
        const command = `get ${touchpoint} function-name/*`;

        const rels: Relation[] = this.graph.runSync(command)
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

    touchpointInputs2(touchpoint: string) {
        const command = `get ${touchpoint} input var type`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => ({
    varStr: rel.getTagValue("var"),
    typeStr: rel.getTagValue("type"),
}));
    }

    touchpointOutputWithType(touchpoint: string): string {
        const command = `get ${touchpoint} output var type`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(touchpointOutputWithType) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("type");
    }

    listHandlers(): string[] {
        const target = this.target;
        const command = `get ${target} handler/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("handler"));
    }

    handlerQuery(handler: string): string {
        const command = `get ${handler} handles-query/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(handlerQuery) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(handlerQuery) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("handles-query");
    }
}