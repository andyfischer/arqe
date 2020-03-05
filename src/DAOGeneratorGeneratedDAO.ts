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
    
    enableVerboseLogging(): boolean {
        const queryStr = `code-generation verbose-logging`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    listTouchpoints(): string[] {
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
    
    touchpointExpectOne(touchpoint: string): boolean {
        const queryStr = `${touchpoint} expectOne`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsOptional(touchpoint: string): boolean {
        const queryStr = `${touchpoint} output optional`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsValue(touchpoint: string): boolean {
        const queryStr = `${touchpoint} output value`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointOutputIsExists(touchpoint: string): boolean {
        const queryStr = `${touchpoint} output exists`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointTagValueOutputs(touchpoint: string): string[] {
        const queryStr = `${touchpoint} output tagValue/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tagValue"));
    }
    
    touchpointTagValueOutput(touchpoint: string): string {
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
    
    touchpointTagOutputs(touchpoint: string): string[] {
        const queryStr = `${touchpoint} output tag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
    
    touchpointTagOutput(touchpoint: string): string[] {
        const queryStr = `${touchpoint} output tag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTagValue("tag"));
    }
    
    touchpointOutputType(touchpoint: string): string {
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
    
    listTouchpointInputs(touchpoint: string): string[] {
        const queryStr = `${touchpoint} input/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("input"));
    }
    
    inputName(input: string): string {
        const queryStr = `${input} name/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("name");
    }
    
    inputType(input: string): string {
        const queryStr = `${input} type/*`;
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
    
    touchpointQueryString(touchpoint: string): string {
        const queryStr = `${touchpoint} query`;
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
    
    getDestinationFilename(): string {
        const queryStr = `code-generation destination-filename`;
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
    
    getOutputObjectdef(touchpoint: string): string {
        const queryStr = `${touchpoint} output objectdef/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("objectdef");
    }
    
    getObjectdefFields(objectdef: string): string[] {
        const queryStr = `${objectdef} objectfield/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("objectdef"));
    }
}