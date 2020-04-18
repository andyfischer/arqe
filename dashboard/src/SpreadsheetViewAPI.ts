import { GraphLike, Relation } from 'ik'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    listColumns(spreadsheet: string): string[] {
        const command = `get ${spreadsheet} col/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("col"));
    }
    
    listRows(spreadsheet: string): string[] {
        const command = `get ${spreadsheet} row/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("row"));
    }
    
    colName(col: string): string {
        const command = `get ${col} name/*`;
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
        return rel.getTagValue("name");
    }
    
    getCellValue(col: string, row: string): string {
        const command = `get ${row} ${col}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getPayload();
    }
    
    setCellValue(col: string, row: string, value: string) {
        const command = `delete ${row} ${col} | set ${row} ${col} == ${value}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
    
    spreadsheetForView(spreadsheetView: string): string {
        const command = `get ${spreadsheetView} spreadsheet/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("spreadsheet");
    }
    
    getSelectedCell(spreadsheetView: string) {
        const command = `get ${spreadsheetView} selection col/* row/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        
        return {
            col: rel.getTag("col"),
            row: rel.getTag("row"),
        }
    }
    
    clearSelection(spreadsheet: string) {
        const command = `delete ${spreadsheet} selection row/* col/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
    
    setSelection(view: string, col: string, row: string) {
        const command = `set ${view} selection ${row} ${col}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
    
    isEditing(view: string): boolean {
        const command = `get ${view} now-editing`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
}
