import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async listCliInputs(toolname: string): Promise<string[]> {
        const command = `get command-line-tool(${toolname}) cli-input name/*`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("name"));
    }

    async getExitStyle(toolname: string): Promise<string> {
        const command = `get command-line-tool(${toolname}) exit-style/*`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(getExitStyle) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("exit-style");
    }

    async cliInputIsRequired(toolname: string, name: string): Promise<boolean> {
        const command = `get command-line-tool(${toolname}) cli-input name/* required`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    async createToolExecution(): Promise<string> {
        const command = `set cli-tool-execution/(unique)`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(createToolExecution) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(createToolExecution) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("cli-tool-execution");
    }

    async setCliInput(execId: string, name: string, value: string) {
        const command = `set ${execId} cli-input(${name}) value/(set ${value})`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}