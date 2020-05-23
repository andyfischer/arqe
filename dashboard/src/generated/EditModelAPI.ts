import { GraphLike, Relation, receiveToRelationListPromise } from "ik"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/edit-model constructor) expected Graph or GraphLike: ' + graph);
        }

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
            throw new Error("(spreadsheetForView) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("spreadsheet");
    }

    findKeyForBrowserName(browserName: string): string {
        const command = `get key/* browsername/${browserName}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(findKeyForBrowserName) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("key");
    }

    findActionForKey(key: string): string {
        const command = `get ${key} action/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(findActionForKey) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("action");
    }

    getCurrentView(): string {
        const command = `get current-view spreadsheet-view/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getCurrentView) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getCurrentView) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("spreadsheet-view");
    }

    getSpreadsheetSelectionPos(view: string) {
        const command = `get ${view} selection col/* row/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getSpreadsheetSelectionPos) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getSpreadsheetSelectionPos) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return {
            col: oneRel.getTag("col"),
            row: oneRel.getTag("row"),
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
            throw new Error("(getMoveActionDelta) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return {
            x: oneRel.getTagValue("delta-x"),
            y: oneRel.getTagValue("delta-y"),
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

        // no output?
    }

    setSelection(view: string, row: string, col: string) {
        const command = `set ${view} selection ${row} ${col}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    startEditing(view: string) {
        const command = `set ${view} now-editing`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    stopEditing(view: string) {
        const command = `delete ${view} now-editing`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
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
            throw new Error("(getInputMode) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getInputMode) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("input-mode");
    }

    setInputMode(view: string, inputMode: string) {
        const command = `delete ${view} input-mode/* | set ${view} ${inputMode}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    findActionForKeyInMode(view: string, key: string): string {
        const command = `get ${view} input-mode/$m | join ${key} action/* active-for-mode input-mode/$m`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(findActionForKeyInMode) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("action");
    }
}