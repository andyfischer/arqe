import { Graph, Relation } from 'ik'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        console.log('Running command: ' + command);
        this.graph.run(command);
    }
    
    listColumns(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} col/*`;
        
        console.log('Running query (for listColumns): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        return rels.map(rel => rel.getTag("col"));
    }
    
    listRows(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} row/*`;
        
        console.log('Running query (for listRows): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        return rels.map(rel => rel.getTag("row"));
    }
    
    colName(col: string): string {
        const queryStr = `${col} name/*`;
        
        console.log('Running query (for colName): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        
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
        
        console.log('Running query (for getCellValue): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getValue();
    }
    
    spreadsheetForView(spreadsheetView: string): string {
        const queryStr = `${spreadsheetView} spreadsheet/*`;
        
        console.log('Running query (for spreadsheetForView): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        
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
        
        console.log('Running query (for getSelectedCell): ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        
        if (rels.length === 0) {
            return null;
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        
        return {
            col: rel.getTagValue("col"),
            row: rel.getTagValue("row"),
        }
    }
}
