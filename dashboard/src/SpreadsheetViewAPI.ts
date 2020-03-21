import { Graph, Relation } from 'ik'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
    }
    
    listColumns(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} col/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("col"));
    }
    
    listRows(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} row/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("row"));
    }
    
    colName(col: string): string {
        const queryStr = `${col} name/*`;
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
    
    getCellValue(col: string, row: string): string {
        const queryStr = `${row} ${col}`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getValue();
    }
    
    setCellValue(col: string, row: string, value: string) {
        const queryStr = `delete ${row} ${col} | set ${row} ${col} == ${value}`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    spreadsheetForView(spreadsheetView: string): string {
        const queryStr = `${spreadsheetView} spreadsheet/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("spreadsheet");
    }
    
    getSelectedCell(spreadsheetView: string) {
        const queryStr = `${spreadsheetView} selection col/* row/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        
        return {
            col: rel.getTag("col"),
            row: rel.getTag("row"),
        }
    }
    
    clearSelection(spreadsheet: string) {
        const queryStr = `delete ${spreadsheet} selection row/* col/*`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    setSelection(view: string, col: string, row: string) {
        const queryStr = `set ${view} selection ${row} ${col}`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    isEditing(view: string): boolean {
        const queryStr = `${view} now-editing`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
}
