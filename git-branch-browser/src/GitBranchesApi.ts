import { GraphLike, Relation, receiveToRelationListPromise } from "./fs"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async getBranches(dir: string): Promise<string[]> {
        const command = `get git dir(${dir}) branch/*`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("branch"));
    }

    async deleteBranch(dir: string, branch: string) {
        const command = `set git dir(${dir}) branch(${branch}) deleted/(set)`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}