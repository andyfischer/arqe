import { Graph, Relation } from '../..'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
    }
    
    getOneTag(): string {
        const queryStr = `a/1 b/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("b");
    }
    
    getOneTagValue(): string {
        const queryStr = `a/1 b/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("b");
    }
    
    getCurrentFlag(target: string): string {
        const queryStr = `${target} flag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("flag");
    }
    
    getUsingCommandChain(target: string) {
        const queryStr = `get ${target} flag/*`;
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
        
        return rel.getTagValue("flag");
    }
    
    changeFlag(target: string, val: string) {
        const queryStr = `delete ${target} flag/* | set ${target} flag/${val}`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
}
