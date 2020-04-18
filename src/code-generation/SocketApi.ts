import { GraphLike, Relation, receiveToRelationListPromise } from '..'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    createUniqueConnection(): string {
        const command = `set connection/unique`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("connection");
    }
    
    deleteConnection(connection: string) {
        const command = `delete ${connection}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
}
