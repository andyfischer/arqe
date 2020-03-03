import Graph from './Graph'
import Relation from './Relation'

export default class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
    }
    
    enableVerboseLogging() {
        // Run query search
        const queryStr = `code-generation verbose-logging`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    listTouchpoints() {
        // Run query search
        const queryStr = `touchpoint/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("touchpoint"));
    }
    
    touchpointFunctionName(touchpoint: string): string {
        // Run query search
        const queryStr = `${touchpoint} .functionName`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getValue();
    }
    
    touchpointExpectOne(touchpoint: string) {
        // Run query search
        const queryStr = `${touchpoint} expectOne`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsValue(touchpoint: string) {
        // Run query search
        const queryStr = `${touchpoint} output value`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsExists(touchpoint: string) {
        // Run query search
        const queryStr = `${touchpoint} output exists`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
}
