import { Graph, Relation } from '.'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    listTargets(): string[] {
        const queryStr = `code-generation/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("code-generation"));
    }
    
    listTouchpoints(target: string): string[] {
        const queryStr = `${target} touchpoint/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("touchpoint"));
    }
    
    getIkImport(target: string): string {
        const queryStr = `${target} ik-import`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getPayload();
    }
    
    enableVerboseLogging(target: string): boolean {
        const queryStr = `${target} verbose-logging`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    touchpointFunctionName(touchpoint: string): string {
        const queryStr = `${touchpoint} function-name`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getPayload();
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
    
    touchpointInputs(touchpoint: string): string[] {
        const queryStr = `${touchpoint} input/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("input"));
    }
    
    inputTagType(input: string): string {
        const queryStr = `${input} tagType/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("tagType");
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
    
    inputSortOrder(input: string): string {
        const queryStr = `${input} sortOrder/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("sortOrder");
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
        return rel.getPayload();
    }
    
    getDestinationFilename(target: string): string {
        const queryStr = `${target} destination-filename/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("destination-filename");
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
    
    touchpointOutputObject(touchpoint: string): string {
        const queryStr = `${touchpoint} output output-object/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("output-object");
    }
    
    outputObjectFields(outputObject: string) {
        const queryStr = `${outputObject} field/* tagValue/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }
    
    outputObjectTagFields(outputObject: string) {
        const queryStr = `${outputObject} field/* tag/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tag: rel.getTagValue("tag"),
        }));
    }
    
    outputObjectTagValueFields(outputObject: string) {
        const queryStr = `${outputObject} field/* tagValue/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        return rels.map(rel => ({
            field: rel.getTagValue("field"),
            tagValue: rel.getTagValue("tagValue"),
        }));
    }
}
