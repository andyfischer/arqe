import { GraphLike, Relation, receiveToRelationListPromise } from "ik"

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

        const oneRel = rels[0];
        return oneRel.getTagValue("name");
    }

    getCellValue(col: string, row: string) {
        const command = `get ${row} ${col}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getPayload();
    }

    setCellValue(col: string, row: string, value: string) {
        const command = `delete ${row} ${col} | set ${row} ${col} == ${value}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
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

        const oneRel = rels[0];
        return oneRel.getTag("spreadsheet");
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

        const oneRel = rels[0];
        return {
            col: oneRel.getTag("col"),
            row: oneRel.getTag("row"),
        }
    }

    clearSelection(spreadsheet: string) {
        const command = `delete ${spreadsheet} selection row/* col/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }

    setSelection(view: string, col: string, row: string) {
        const command = `set ${view} selection ${row} ${col}`;

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
}