import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    getOneTag(): string {
        const command = `get a/1 b/*`;

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
        return oneRel.getTag("b");
    }

    getOneTagValue(): string {
        const command = `get a/1 b/*`;

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
        return oneRel.getTagValue("b");
    }

    getCurrentFlag(target: string): string {
        const command = `get ${target} flag/*`;

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
        return oneRel.getTagValue("flag");
    }

    getUsingCommandChain(target: string): string {
        const command = `get ${target} flag/*`;

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
        return oneRel.getTagValue("flag");
    }

    changeFlag(target: string, val: string) {
        const command = `delete ${target} flag/* | set ${target} flag/${val}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}