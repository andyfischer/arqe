import { GraphLike, Tuple, receiveToTupleListPromise } from "ik"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/spreadsheet-view constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listColumns(spreadsheet: string): string[] {
        const command = `get ${spreadsheet} col/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => rel.getTagAsString("col"));
    }

    listRows(spreadsheet: string): string[] {
        const command = `get ${spreadsheet} row/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => rel.getTagAsString("row"));
    }

    colName(col: string): string {
        const command = `get ${col} name/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(colName) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(colName) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("name");
    }

    getCellValue(col: string, row: string): string {
        const command = `get ${row} ${col} value/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(getCellValue) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("value");
    }

    setCellValue(col: string, row: string, value: string) {
        const command = `delete ${row} ${col} | set ${row} ${col} == ${value}`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    spreadsheetForView(spreadsheetView: string): string {
        const command = `get ${spreadsheetView} spreadsheet/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(spreadsheetForView) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagAsString("spreadsheet");
    }

    getSelectedCell(spreadsheetView: string) {
        const command = `get ${spreadsheetView} selection col/* row/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        if (rels.length === 0) {
            return null;
        }

        if (rels.length > 1) {
            throw new Error("(getSelectedCell) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return {
            col: oneRel.getTagAsString("col"),
            row: oneRel.getTagAsString("row"),
        }
    }

    clearSelection(spreadsheet: string) {
        const command = `delete ${spreadsheet} selection row/* col/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    setSelection(view: string, row: string, col: string) {
        const command = `set ${view} selection ${row} ${col}`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    isEditing(view: string): boolean {
        const command = `get ${view} now-editing`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.length > 0;
    }
}