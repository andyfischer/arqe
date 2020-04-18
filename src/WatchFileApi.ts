import { GraphLike, Relation, receiveToRelationListPromise } from '.'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    async findFileWatch(filename: string): Promise<string> {
        const command = `get file-watch/* filename(${filename})`;
        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("file-watch");
    }
    
    async createFileWatch(filename: string): Promise<string> {
        const command = `set file-watch/(unique) filename(${filename})`;
        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("file-watch");
    }
}
