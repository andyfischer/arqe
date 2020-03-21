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
        const queryStr = `delete ${spreadsheet} selection row/* col/*`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    setSelection(view: string, row: string, col: string) {
        const queryStr = `set ${view} selection ${row} ${col}`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    startEditing(view: string) {
        const queryStr = `set ${view} now-editing`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    stopEditing(view: string) {
        const queryStr = `delete ${view} now-editing`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    isEditing(view: string): boolean {
        const queryStr = `${view} now-editing`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.length > 0;
    }
    
    getInputMode(view: string): string {
        const queryStr = `${view} input-mode/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getTagValue("input-mode");
    }
    
    setInputMode(view: string, inputMode: string) {
        if (!inputMode.startsWith("input-mode/")) {
            throw new Error('Expected "input-mode/...", saw: ' + inputMode);
        }
        
        const queryStr = `delete ${view} input-mode/* | set ${view} input-mode/${inputMode}`;
        this.graph.runCommandChainSync(queryStr);
        
        // TODO - handle multi results
    }
    
    findActionForKeyInMode(view: string, key: string) {
        const queryStr = `get ${view} input-mode/$m | join ${key} action/* active-for-mode input-mode/$m`;
        const rels = this.graph.runCommandChainSync(queryStr)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        
        return rel.getTag("action");
    }
}
