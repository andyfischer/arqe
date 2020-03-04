import Graph from './Graph'
import Relation from './Relation'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
    }
    
    enableVerboseLogging() {
        const queryStr = `code-generation verbose-logging`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    listTouchpoints() {
        const queryStr = `touchpoint/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("touchpoint"));
    }
    
    touchpointFunctionName(touchpoint: string): string {
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
        const queryStr = `${touchpoint} expectOne`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsOptional(touchpoint: string) {
        const queryStr = `${touchpoint} output optional`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsValue(touchpoint: string) {
        const queryStr = `${touchpoint} output value`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsExists(touchpoint: string) {
        const queryStr = `${touchpoint} output exists`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointTagValueOutputs(touchpoint: string) {
        const queryStr = `${touchpoint} output tagValue/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tagValue"));
    }
    
    touchpointTagValueOutput(touchpoint: string) {
        const queryStr = `${touchpoint} output tagValue/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("tagValue");
    }
    
    touchpointTagOutputs(touchpoint: string) {
        const queryStr = `${touchpoint} output tag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
    
    touchpointTagOutput(touchpoint: string) {
        const queryStr = `${touchpoint} output tag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
    
    touchpointOutputType(touchpoint: string) {
        const queryStr = `${touchpoint} output type/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("type");
    }
    
    listTouchpointInputs(touchpoint: string) {
        const queryStr = `${touchpoint} input/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("input"));
    }
}
