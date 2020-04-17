import { GraphLike, Relation } from '..'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    createUniqueConnection() {
        const queryStr = `set connection/unique`;
        const rels = this.graph.runCommandChainSync(queryStr)
            .filter(rel => !rel.hasType("command-meta"));
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        
        return rel.getTag("connection");
    }
    
    deleteConnection(connection: string) {
        const queryStr = `delete ${connection}`;
        const rels = this.graph.runCommandChainSync(queryStr)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
}
