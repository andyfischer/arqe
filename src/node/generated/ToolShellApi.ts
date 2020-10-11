import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/cliShell constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    async listCliInputs(toolname: string): Promise<string[]> {
        const command = `get command-line-tool(${toolname}) cli-input name/*`;

        const [ receiver, promise ] = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => rel.getVal("name"));
    }

    async getExitStyle(toolname: string): Promise<string> {
        const command = `get command-line-tool(${toolname}) exit-style/*`;

        const [ receiver, promise ] = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(getExitStyle) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("exit-style");
    }

    async cliInputIsRequired(toolname: string, name: string): Promise<boolean> {
        const command = `get command-line-tool(${toolname}) cli-input name/* required`;

        const [ receiver, promise ] = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.length > 0;
    }

    async createToolExecution(): Promise<string> {
        const command = `set cli-tool-execution/(unique)`;

        const [ receiver, promise ] = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(createToolExecution) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(createToolExecution) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagAsString("cli-tool-execution");
    }

    async setCliInput(execId: string, name: string, value: string) {
        const command = `set ${execId} cli-input(${name}) value/(set ${value})`;

        const [ receiver, promise ] = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }
}