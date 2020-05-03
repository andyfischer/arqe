import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async listCliInputs(tool: string) {
        const command = `get ${tool} cli-input/* value`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    async cliInputIsRequired(tool: string, name: string): Promise<boolean> {
        const command = `get ${tool} cli-input/* required`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.length > 0;
    }

    async setCliInput(name: string, value: string) {
        const command = `set cli-input(${name}) value/(set ${value})`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}