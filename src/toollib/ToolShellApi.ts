import { GraphLike, Relation, receiveToRelationListPromise } from ".."

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

    async cliInputIsRequired(toolname: string, name: string): Promise<boolean> {
        const command = `get command-line-tool(${toolname}) cli-input name/* required`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    async createToolExecution(): Promise<string[]> {
        const command = `set cli-tool-execution/(unique)`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("cli-tool-execution"));
    }

    async setCliInput(exec: string, name: string, value: string) {
        const command = `set $exec cli-input(${name}) value/(set ${value})`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}