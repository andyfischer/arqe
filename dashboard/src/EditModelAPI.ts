import { GraphLike, Relation } from 'ik'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
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
    
    findKeyForBrowserName(browserName: string): string {
        const command = `get key/* browsername/${browserName}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("key");
    }
    
    findActionForKey(key: string): string {
        const command = `get ${key} action/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTag("action");
    }
    
    getCurrentView(): string {
        const command = `get current-view spreadsheet-view/*`;
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
        return rel.getTag("spreadsheet-view");
    }
    
    getSpreadsheetSelectionPos(view: string) {
        const command = `get ${view} selection col/* row/*`;
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
        
        return {
            col: rel.getTag("col"),
            row: rel.getTag("row"),
        }
    }
    
    getMoveActionDelta(action: string) {
        const command = `get ${action} delta-x/* delta-y/*`;
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
            x: rel.getTagValue("delta-x"),
            y: rel.getTagValue("delta-y"),
        }
    }
    
    rowOrColExists(item: string, spreadsheet: string): boolean {
        const command = `get ${spreadsheet} ${item}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
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
    
    startEditing(view: string) {
        const command = `set ${view} now-editing`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
    
    stopEditing(view: string) {
        const command = `delete ${view} now-editing`;
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
    
    getInputMode(view: string): string {
        const command = `get ${view} input-mode/*`;
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
        return rel.getTagValue("input-mode");
    }
    
    setInputMode(view: string, inputMode: string) {
        if (!inputMode.startsWith("input-mode/")) {
            throw new Error('Expected "input-mode/...", saw: ' + inputMode);
        }
        
        const command = `delete ${view} input-mode/* | set ${view} ${inputMode}`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // TODO - handle multi results
    }
    
    findActionForKeyInMode(view: string, key: string) {
        const command = `get ${view} input-mode/$m | join ${key} action/* active-for-mode input-mode/$m`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        
        return rel.getTag("action");
    }
}
