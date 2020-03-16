import { Graph, Relation } from 'ik'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
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
    
    findKeyForBrowserName(browserName: string): string {
        const queryStr = `key/* browsername/${browserName}`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("key");
    }
    
    findActionForKey(key: string): string {
        const queryStr = `${key} action/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("action");
    }
    
    getCurrentView(): string {
        const queryStr = `current-view spreadsheet-view/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTag("spreadsheet-view");
    }
    
    getSpreadsheetSelectionPos(view: string) {
        const queryStr = `${view} selection col/* row/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
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
    
    getMoveActionDelta(action: string) {
        const queryStr = `${action} delta-x/* delta-y/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        
        return {
            x: rel.getTagValue("delta-x"),
            y: rel.getTagValue("delta-y"),
        }
    }
    
    rowOrColExists(item: string, spreadsheet: string): boolean {
        const queryStr = `${spreadsheet} ${item}`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    clearSelection(spreadsheet: string) {
        this.graph.runSync(`delete ${spreadsheet} selection row/* col/*`);
    }
    
    setSelection(col: string, row: string, view: string) {
        this.graph.runSync(`set ${view} selection ${row} ${col}`);
    }
    
    startEditing(view: string) {
        this.graph.runSync(`set ${view} now-editing`);
    }
    
    stopEditing(view: string) {
        this.graph.runSync(`delete ${view} now-editing`);
    }
    
    isEditing(view: string): boolean {
        const queryStr = `${view} now-editing`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
}
